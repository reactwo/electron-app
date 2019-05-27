const DEVICE_STEPS = {
    // Yu Yunique Plus
    'YU4711': [
        {
            title: 'Step 2',
            subtitle: 'Restoring Device',
            text: "<ol>\
                    <li>This process can take up to 10 mins</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Restore',
            skippable: false,
            autostart: true,
            action: () => {
              ipcRenderer.send('restore-device');
            }
        }
    ],
    // Lyf Water 1
    'LS-5002': [
         {
            title: 'Step 2',
            subtitle: 'Making space for apps',
            text: "<ol>\
                    <li>This process will take a minute</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Cleanup',
            skippable: true,
            autostart: false,
            action: () => {
              ipcRenderer.send('remove-apps');
            }
        },
        {
            title: 'Step 3',
            subtitle: 'Install apps',
            text: "<ol>\
                    <li>This process can take up to 25 mins</li>\
                    <li>Check the screen for any prompts. When in doubt - Agree with any prompt.</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Install',
            skippable: true,
            autostart: false,
            action: () => {
              ipcRenderer.send('install-apps');
            }
        },
        {
            title: 'Step 4',
            subtitle: 'Copy app data - part 1',
            text: "<ol>\
                    <li>Wake and unlock the device, before pressing the button below</li>\
                    <li>When prompted on screen, enter the password as <strong>trabug</strong> and then tap <strong>Restore My Data</strong></li>\
                    <li>This process can take up to 5 mins</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Copy',
            skippable: false,
            autostart: false,
            action: () => {
              ipcRenderer.send('restore-backup');
            }
        },
        {
            title: 'Step 5',
            subtitle: 'Copy app data - part 2',
            text: "<ol>\
                    <li>This process can take up to 2 mins</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Copy',
            skippable: false,
            autostart: true,
            action: () => {
              ipcRenderer.send('restore-data');
            }
        },
        {
            title: 'Step 6',
            subtitle: 'Finalize Setup',
            text: "<ol>\
                    <li>Launch the <strong>Settings app</strong></li>\
                    <li>Scroll down and then tap on <strong>Developer options</strong></li>\
                    <li>Tap the switch next to On to turn it <strong>Off</strong></li>\
                    <li>Press the <strong>device Back button</strong> to go back to the settings list</li>\
                    <li>Tap on <strong>Developer options again</strong> and make sure the switch is <strong>Off</strong></li>\
                    <li>Scroll up and then tap on <strong>Home</strong></li>\
                    <li>Select <strong>DOMLauncher</strong> from the list</li>\
                    <li>Press the <strong>device Home button</strong> and wait for the Trabug Provisioning screen to load</li>\
                    <li>Now <strong>disconnect the USB cable</strong> and then <strong>Reboot</strong> the device</li>\
                    <li>If prompted about <strong>Google's location service</strong> on reboot, then tap <strong>Don't show again</strong> and tap <strong>Agree</strong> and choose <strong>Yes</strong> on the next prompt</li>\
                  </ol>",
            btn: 'Done',
            skippable: false,
            autostart: false,
            action: () => {
              onStepActionComplete(true);
            }
        }
    ],
    // Lyf Wind 7i/7s
    'LS-5016': [
        {
            title: 'Step 2',
            subtitle: 'Making space for apps',
            text: "<ol>\
                    <li>This process will take a minute</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Cleanup',
            skippable: true,
            autostart: false,
            action: () => {
              ipcRenderer.send('remove-apps');
            }
        },
        {
            title: 'Step 3',
            subtitle: 'Install apps',
            text: "<ol>\
                    <li>This process can take up to 25 mins</li>\
                    <li>Check the screen for any prompts. When in doubt - Agree with any prompt.</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Install',
            skippable: true,
            autostart: false,
            action: () => {
              ipcRenderer.send('install-apps');
            }
        },
        {
            title: 'Step 4',
            subtitle: 'Copy app data - part 1',
            text: "<ol>\
                    <li>Wake and unlock the device, before pressing the button below</li>\
                    <li>When prompted on screen, enter the password as <strong>trabug</strong> and then tap <strong>Restore My Data</strong></li>\
                    <li>This process can take up to 5 mins</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Copy',
            skippable: false,
            autostart: false,
            action: () => {
              ipcRenderer.send('restore-backup');
            }
        },
        {
            title: 'Step 5',
            subtitle: 'Copy app data - part 2',
            text: "<ol>\
                    <li>This process can take up to 2 mins</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Copy',
            skippable: false,
            autostart: true,
            action: () => {
              ipcRenderer.send('restore-data');
            }
        },
        {
            title: 'Step 6',
            subtitle: 'Finalize Setup',
            text: "<ol>\
                    <li>Launch the <strong>Settings app</strong></li>\
                    <li>Scroll down and then tap on <strong>Developer options</strong></li>\
                    <li>Tap the switch next to On to turn it <strong>Off</strong></li>\
                    <li>Press the <strong>device Back button</strong> to go back to the settings list</li>\
                    <li>Tap on <strong>Developer options again</strong> and make sure the switch is <strong>Off</strong></li>\
                    <li>Scroll up and then tap on <strong>Home</strong></li>\
                    <li>Select <strong>DOMLauncher</strong> from the list</li>\
                    <li>Press the <strong>device Home button</strong> and wait for the Trabug Provisioning screen to load</li>\
                    <li>Now <strong>disconnect the USB cable</strong> and then <strong>Reboot</strong> the device</li>\
                    <li>If prompted about <strong>Google's location service</strong> on reboot, then tap <strong>Don't show again</strong> and tap <strong>Agree</strong> and choose <strong>Yes</strong> on the next prompt</li>\
                  </ol>",
            btn: 'Done',
            skippable: false,
            autostart: false,
            action: () => {
              onStepActionComplete(true);
            }
        }
    ],
    'PHICOMM E653': [
        {
            title: 'Step 2',
            subtitle: 'Install apps',
            text: "<ol>\
                    <li>This process can take up to 25 mins</li>\
                    <li>Check the screen for any prompts. When in doubt - Agree with any prompt.</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Install',
            skippable: true,
            autostart: false,
            action: () => {
              ipcRenderer.send('install-apps');
            }
        },
        {
            title: 'Step 3',
            subtitle: 'Copy app data - part 1',
            text: "<ol>\
                    <li>Wake and unlock the device, before pressing the button below</li>\
                    <li>When prompted on screen, enter the password as <strong>trabug</strong> and then tap <strong>Restore My Data</strong></li>\
                    <li>This process can take up to 5 mins</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Copy',
            skippable: false,
            autostart: false,
            action: () => {
              ipcRenderer.send('restore-backup');
            }
        },
        {
            title: 'Step 3',
            subtitle: 'Copy app data - part 2',
            text: "<ol>\
                    <li>This process can take up to 2 mins</li>\
                    <li><strong>Do not disconnect the USB cable</strong></li>\
                  </ol>",
            btn: 'Start Copy',
            skippable: false,
            autostart: true,
            action: () => {
              ipcRenderer.send('restore-data');
            }
        },
        {
            title: 'Step 4',
            subtitle: 'Enable Device Services',
            text: "<ol>\
                  <li>Wake and unlock the device, if required</li>\
                  <li>Press the <strong>device Home button</strong> and choose the <strong>Always</strong> option</li>\
                  <li>Open the <strong>Settings App</strong></li>\
                  <li>Tap <strong>Wi-Fi</strong>. Turn it <strong>On</strong> and connect to the Office WiFi.</li>\
                  <li>Press the <strong>device back button</strong> to get to the list of settings.</li>\
                  <li>Scroll down and tap on <strong>Location</strong></li>\
                  <li>Make sure to <strong>Agree</strong> to any questions that pop-up during the steps below.</li>\
                  <li>Turn location <strong>On</strong> and then tap on <strong>Mode</strong></li>\
                  <li>Make sure <strong>High Accuracy</strong> and <strong>Accelerated location</strong> are both <strong>On</strong>.</li>\
                  </ol>",
            btn: 'Done',
            skippable: false,
            autostart: false,
            action: () => {
              onStepActionComplete(true);
            }
        },
        {
            title: 'Step 5',
            subtitle: 'Finalize Setup',
            text: "<ol>\
                    <li>Launch the <strong>Settings app</strong></li>\
                    <li>Scroll down and then tap on <strong>Developer options</strong></li>\
                    <li>Tap the switch next to On to turn it <strong>Off</strong></li>\
                    <li>Press the <strong>device Back button</strong> to go back to the settings list</li>\
                    <li>Tap on <strong>Developer options again</strong> and make sure the switch is <strong>Off</strong></li>\
                    <li>Scroll up and then tap on <strong>Home</strong></li>\
                    <li>Select <strong>DOMLauncher</strong> from the list</li>\
                    <li>Press the <strong>device Home button</strong> and wait for the Trabug Provisioning screen to load</li>\
                    <li>Now <strong>disconnect the USB cable</strong> and then <strong>Reboot</strong> the device</li>\
                    <li>If prompted about <strong>Google's location service</strong> on reboot, then tap <strong>Don't show again</strong> and tap <strong>Agree</strong> and choose <strong>Yes</strong> on the next prompt</li>\
                  </ol>",
            btn: 'Done',
            skippable: false,
            autostart: false,
            action: () => {
              onStepActionComplete(true);
            }
        }
    ]
}