'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, deviceManager;

const {exec, execFile} = require('child_process');
const {ipcMain} = require('electron');
const async = require("async");
var fs = require('fs');

let adb = 'adb';
let files = 'files';

const isDev = process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath);

if (!isDev) {
  files = process.resourcesPath + '/app/files';
  adb = process.resourcesPath + '/app/adb';
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

class DeviceManager {

    constructor(msg_callback, model_callback) {
        this.timer = null;
        this.deviceConnected = null;
        this.deviceModel = null;
        this.adb_error = false;
        this.msg_callback = msg_callback;
        this.model_callback = model_callback;

        const MessageHandlers = [
            {on: 'software-update', action: this.copySoftwareUpdate.bind(this)},
            {on: 'software-update-complete', action: this.removeSoftwareUpdate.bind(this)},
            {on: 'install-apps', action: this.installApps.bind(this)},
            {on: 'remove-apps', action: this.removeApps.bind(this)},
            {on: 'restore-data', action: this.restoreFiles.bind(this)},
            {on: 'restore-backup', action: this.restoreBackups.bind(this)},
            {on: 'restore-device', action: this.restoreDevice.bind(this)}
        ]

        var me = this;

        MessageHandlers.forEach((item) => {
            ipcMain.on(item.on, (event) => {
                item.action(event.sender);
            });
        });
    }

    getDeviceFileName(path, name, ext) {
        var base = path + name;
        if (this.deviceModel) {
            var model_path = base + '-' + slugify(this.deviceModel) + ext;
            if (fs.existsSync(model_path)) {
                return model_path;
            }
        }

        return base + ext;
    }

    restoreDevice(sender) {
        const deviceid = this.deviceConnected;
        const deviceName = this.getDeviceName();
        async.series([
                (callback) => {
                    this.msg_callback('Rebooting', deviceName);
                    exec(`${adb} reboot recovery`, (error) => {
                        exec(`${adb} wait-for-recovery`, (error) => {
                            setTimeout(() => {callback(error)}, 5000);
                        });
                    });
                },
                (callback) => {
                    this.msg_callback('Clean', 'cache');
                    exec(`${adb} shell twrp wipe cache`, (error) => {
                        if (error) {
                            callback(error);
                        } else {
                            setTimeout(() => {callback(null)}, 1000);
                        }
                    });
                },
                (callback) => {
                    this.msg_callback('Clean', 'dalvik');
                    exec(`${adb} shell twrp wipe dalvik`, (error) => {
                        if (error) {
                            callback(error);
                        } else {
                            setTimeout(() => {callback(null)}, 1000);
                        }
                    });
                },
                (callback) => {
                    this.msg_callback('Clean', 'Internal SD card');
                    const ToRemove = ['Android', 'Snapchat', 'Whatsapp', 'Pictures',
                                    'Download', 'DCIM', 'Alarms', 'Movies', 'Music'];
                    async.eachSeries(ToRemove, (item, series_callback) => {
                            exec(`${adb} shell twrp cmd rm -rf /data/media/0/${item}/*`, (err) => {
                                series_callback(err);
                            });
                        }, callback);
                },
                (callback) => {
                    this.msg_callback('Set', 'tw_disable_free_space');
                    exec(`${adb} shell twrp set tw_disable_free_space 1`, (error) => {
                        callback(error);
                    });
                },
                (callback) => {
                    this.msg_callback('Set', 'tw_force_md5_check');
                    exec(`${adb} shell twrp set tw_force_md5_check 0`, (error) => {
                        callback(error);
                    });
                },
                (callback) => {
                    this.msg_callback('Set', 'tw_storage_path');
                    exec(`${adb} shell twrp set tw_storage_path /data/media/0`, (error) => {
                        if (error) {
                            callback(error);
                        } else {
                            setTimeout(() => {callback(null)}, 2000);
                        }
                    });
                },
                (callback) => {
                    this.msg_callback('Restoring', deviceName);
                    exec(`${adb} shell twrp restore /data/media/0/TWRP/BACKUPS/${deviceid}/trabug`, (error) => {
                        if (error) {
                            callback(error);
                        } else {
                            setTimeout(() => {callback(null)}, 2000);
                        }
                    });
                },
                (callback) => {
                    this.msg_callback('Rebooting', deviceName);
                    exec(`${adb} shell reboot`, (error) => {
                        callback(error);
                    });
                }
            ],
            (err) => {
                if (err) {
                    this.msg_callback('RESTART APP. FATAL ERROR', err.message);
                } else {
                    this.deviceConnected = null;
                    this.adb_error = true;
                    sender.send('action-complete', true);
                }
            }
        );
    }

    copySoftwareUpdate(sender) {
        this.execCommand(sender, `${adb} push ${files}/TF_update.zip /sdcard/`)
    }

    removeSoftwareUpdate(sender) {
        this.execCommand(sender, `${adb} shell rm /sdcard/TF_update.zip`, true)
    }

    restoreBackups(sender) {
        const ToRestore = ["device"];

        async.eachSeries(ToRestore, (item, callback) => {
                var fileName = this.getDeviceFileName(`${files}/`, item, '.backup');
                exec(`${adb} restore ${fileName}`, (error) => {
                    callback(error);
                });
            },
            (err) => {
                if (err) {
                    this.msg_callback('retrying', err.message);
                    setTimeout(() => {
                        this.restoreBackups(sender);
                    }, 10);
                } else {
                    sender.send('action-complete', true);
                }
            }
        );
    }

    restoreFiles(sender) {
        var fileName = this.getDeviceFileName(`${files}/`, 'lock-screen-img', '.jpg');
        async.series([
            (callback) => {
                exec(`${adb} push ${fileName} /sdcard/DOMLauncher/lock-screen-img.jpg`, (error) => {
                  callback(error);
                });
              }
            ],
            function (err) {
                if (err) {
                    // Retry
                    setTimeout(() => {
                        this.restoreFiles(sender);
                    }, 10);
                } else {
                    sender.send('action-complete', true);
                }
            }
        );
    }

    removeApps(sender) {
        const ToRemove = {
            'LS-5016': [
                'com.bt.bms',
                'com.yatra.base',
                'com.corpay.mwallet',
                'in.amazon.mShop.android.shopping',
                'com.jio.media.ondemand',
                'com.jio.jioplay.tv',
                'com.jio.media.jiobeats',
                'com.jio.media.jioxpressnews',
                'com.reliancejio.mobilesecurity',
                'com.jiochat.jiochatapp',
                'com.jio.mhood.jionet',
                'jio.cloud.drive',
                'com.jio.media.mags',
                'com.jio.myjio',
                'com.meitu.beautyplusme',
                'com.inn.nvengineer'
            ],
            'LS-5002': [
                'com.corpay.mwallet',
                'com.jio.media.ondemand',
                'com.jio.jioplay.tv',
                'com.jio.media.jiobeats',
                'com.jio.media.jioxpressnews',
                'com.reliancejio.mobilesecurity',
                'com.jiochat.jiochatapp',
                'com.jio.mhood.jionet',
                'jio.cloud.drive',
                'com.jio.media.mags',
                'com.jio.myjio'
            ]
        };
        async.eachSeries(ToRemove[this.deviceModel],
            (item, callback) => {
                this.msg_callback('removing', item);
                exec(`${adb} shell pm uninstall ${item}`, (error/*, stdout, stderr*/) => {
                    if (error) {
                        callback(error);
                    } else {
                        setTimeout(() => {callback(null)}, 1500);
                    }
                });
            },
            (err) => {
                if (this.deviceConnected) {
                    this.msg_callback('connected', this.getDeviceName());
                }
                sender.send('action-complete', true);
            }
        );
    }

    installApps(sender) {

        const DeviceInstall = {
            'LS-5016': [
                'lyfcare'
            ],
            'LS-5002': [
                'lyfcare'
            ]
        };

        var ToInstall = [
            'gms',
            'webview',
            'audiocompass',
            'chrome',
            'docs',
            'facebook.katana',
            'facebook.orca',
            'instagram',
            'irctc',
            'maps',
            'olacabs',
            'skype',
            'snapchat',
            'translate',
            'twitter',
            'uber',
            'whatsapp',
            'youtube',
            'trabug-app',
            'trabug-launcher',
        ];

        if (this.deviceModel) {
            if (DeviceInstall.hasOwnProperty(this.deviceModel)) {
                ToInstall = ToInstall.concat(DeviceInstall[this.deviceModel]);
            }
        }

        var total = ToInstall.length, idx =0;

        async.eachSeries(ToInstall,
            (item, callback) => {
                idx++;
                this.msg_callback('installing', `${item} (${idx}/${total})`);
                var fileName = this.getDeviceFileName(`${files}/apks/`, item, '.apk');
                // `${adb} install -rg ${fileName}`
                execFile(adb, ['install', '-rg', fileName], (error/*, stdout, stderr*/) => {
                    if (error) {
                        console.log(error.message);
                    }
                    callback(error);
                });
            },
            (err) => {
                if (err) {
                    this.msg_callback('retrying', err.message);
                    console.log(err.message);

                    setTimeout(() => {
                        if (this.deviceConnected) {
                            this.installApps(sender);
                        }
                    }, 8000);
                } else {
                    if (this.deviceConnected) {
                        this.msg_callback('connected', this.getDeviceName());
                    }
                    sender.send('action-complete', true);
                }
            }
        );
    }

    enableTimer() {
        this.timer = setInterval(this.checkDeviceStatus.bind(this), 1000);
    }

    disableTimer() {
        if (this.timer) clearInterval(this.timer);
        this.timer = null;
    }

    getDeviceName() {
        return this.deviceModel + ' (' + this.deviceConnected + ')';
    }

    getDeviceModel() {
        const child = exec(`${adb} shell getprop ro.product.model`,
            (error, stdout, stderr) => {
                this.deviceModel = stdout.trim().split('\n');
                this.model_callback(this.deviceModel);
                this.msg_callback('connected', this.getDeviceName());
            }
        );
    }

    checkDeviceStatus() {
        const child = exec(`${adb} devices`,
            (error, stdout, stderr) => {
                if (error !== null) {
                    this.msg_callback('error', error.message);
                    this.adb_error = true;
                    return;
                }
                else if (this.adb_error) {
                    this.msg_callback('waiting', '');
                    this.adb_error = false;
                }

                var connected = false;
                var lines = stdout.trim().split('\n');
                if (lines.length > 1) {
                    var device = lines[1].trim();
                    if (device.endsWith('device')) {
                        connected = true;
                        device = device.substring(0, device.length - 7);
                        if (device && this.deviceConnected != device) {
                            this.deviceConnected = device;
                            this.getDeviceModel();
                        }
                    }
                }

                if (!connected && this.deviceConnected) {
                    this.msg_callback('disconnected', this.deviceConnected);
                    this.deviceConnected = null;
                    this.deviceModel = null;
                }
            }
        );
    }

    execCommand(sender, cmd, ignore_errors) {
        if (ignore_errors !== true) ignore_errors = false;

        const child = exec(cmd, (error, stdout, stderr) => {
            var ret = true;
            if (!ignore_errors && (error !== null)) {
              ret = error;
            }
            if (sender) {
              sender.send('action-complete', ret);
            }
        });
    }
}


function deviceMessage(status, name) {
  if (mainWindow) {
    mainWindow.webContents.send('device', status, name);
  }
}

function modelMessage(model) {
  if (mainWindow) {
    mainWindow.webContents.send('model', model);
  }
}


function createWindow () {
  deviceManager = new DeviceManager(deviceMessage, modelMessage);

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 750, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  if (isDev) {
      mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    deviceManager.enableTimer();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    deviceManager.disableTimer();
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
