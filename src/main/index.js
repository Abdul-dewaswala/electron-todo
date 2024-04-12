import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'

let mainWindow = null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 670,
    show: false,
    frame: false,
    resizable: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : { icon }),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('minimize', () => mainWindow.minimize())
  ipcMain.on('quit', () => app.quit())
  ipcMain.on('drag-window', (event, deltaX, deltaY) => {
    const { x, y } = mainWindow.getPosition()
    mainWindow.setPosition(x + deltaX, y + deltaY, true)
  })
  ipcMain.on('change-screen', (event, screen) => {
    mainWindow.webContents.send('set-screen', screen)
  })
  ipcMain.on('add-todos', (e, todoJson) => {
    fs.readFile('fileList.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        return
      }
      try {
        let file = JSON.parse(data).find((f) => f.selected)
        fs.writeFileSync(file.fileName, todoJson)
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    })
  })
  ipcMain.on('todos', () => {
    fs.readFile('fileList.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        return
      }
      try {
        let file = JSON.parse(data).find((f) => f.selected)
        fs.readFile(file.fileName, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err)
            return
          }
          try {
            const todos = JSON.parse(data)
            mainWindow.webContents.send('get-todos', todos)
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        })
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    })
  })
  ipcMain.on('add-to-list', (e, title) => {
    const filePath = 'fileList.json'
    let fileName = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
    fileName += `-${new Date().getTime()}.json`

    const createData = {
      title: title,
      created: new Date(),
      fileName: fileName,
      selected: true
    }
    let files = []
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        files = [createData]
        fs.writeFileSync(filePath, JSON.stringify(files), (err) => {
          if (err) {
            return
          }
        })
      } else {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err)
          }
          try {
            files = JSON.parse(data).map((obj) => {
              obj.selected = false
              return obj
            })
            files.unshift(createData)
            fs.writeFileSync(filePath, JSON.stringify(files), (err) => {
              if (err) {
                return
              }
            })
            mainWindow.webContents.send('get-list', files)
            fs.writeFileSync(fileName, JSON.stringify([]))
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        })
      }
    })
  })
  ipcMain.on('task-list', () => {
    fs.readFile('fileList.json', 'utf8', (err, data) => {
      if (err) {
        const list = [
          {
            title: 'Default',
            created: new Date(),
            fileName: 'default.json',
            selected: true
          }
        ]
        fs.writeFileSync('fileList.json', JSON.stringify(list), (err) => {
          if (err) {
            return
          }
        })
        fs.writeFileSync('default.json', JSON.stringify([]))
        mainWindow.webContents.send('get-list', list)
        return
      }
      try {
        let file = JSON.parse(data)
        mainWindow.webContents.send('get-list', file)
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    })
  })
  ipcMain.on('change-list', (e, filename) => {
    fs.readFile('fileList.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        return
      }
      try {
        let file = JSON.parse(data).map((f) => {
          f.selected = f.fileName == filename
          return f
        })
        mainWindow.webContents.send('get-list', file)
        fs.writeFileSync('fileList.json', JSON.stringify(file), (err) => {
          if (err) {
            return
          }
        })
        fs.readFile(filename, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err)
            return
          }
          try {
            const todos = JSON.parse(data)
            mainWindow.webContents.send('get-todos', todos)
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        })
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    })
  })
  ipcMain.on('clear-todos', () => {
    fs.readFile('fileList.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        return
      }
      try {
        let file = JSON.parse(data).find((f) => f.selected)
        fs.writeFileSync(file.fileName, JSON.stringify([]))
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    })
  })
  ipcMain.on('delete-todos', () => {
    fs.readFile('fileList.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err)
        return
      }
      try {
        let fileSelected = JSON.parse(data).find((f) => f.selected)
        // delete file
        fs.unlinkSync(fileSelected.fileName)
        let files = JSON.parse(data).filter((f) => !f.selected)
        files = files.map((f, index) => {
          f.selected = index == 0
          return f
        })
        const selectedFile = files.find((f) => f.selected)
        mainWindow.webContents.send('get-list', files)
        fs.readFile(selectedFile.fileName, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading file:', err)
            return
          }
          try {
            const todos = JSON.parse(data)
            mainWindow.webContents.send('get-todos', todos)
          } catch (error) {
            console.error('Error parsing JSON:', error)
          }
        })
        fs.writeFileSync('fileList.json', JSON.stringify(files), (err) => {
          if (err) {
            return
          }
        })
      } catch (error) {
        console.error('Error parsing JSON:', error)
      }
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
