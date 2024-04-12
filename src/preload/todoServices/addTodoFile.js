/* eslint-disable prettier/prettier */
import fs from 'fs'

const filePath = 'fileList.json'

const addTodoFile = (title) => {
	let fileName = title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/--+/g, '-').trim()
	fileName += `-${(new Date()).getTime()}.json`

	const createData = {
		title: title,
		created: new Date(),
		fileName: fileName,
		selected: true
	}
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const list = [createData]
      fs.writeFileSync(filePath, JSON.stringify(list), (err) => {
        if (err) {
          return 
        }
      })
			return {
				ack: 1
			}
    } else {
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					console.error('Error reading file:', err)
					return
				}
				try {
					let files = JSON.parse(data).map((obj) => {
						obj.selected = false
						return obj;
					})
					files.unshift(createData)
					fs.writeFileSync(filePath, JSON.stringify(files), (err) => {
						if (err) {
							return 
						}
					})
					fs.writeFileSync(fileName, JSON.stringify([]))
					return 	{
						ack: 1
					}
				} catch (error) {
					console.error('Error parsing JSON:', error)
				}
			})
      console.log('File already exists.')
    }
  })
}

export default addTodoFile
