/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import {
  Grid, Input, InputAdornment, FormControl, Button, List, ListItem, Checkbox, FormControlLabel,
  CardContent, Typography
} from '@mui/material';
import { 
  Checklist as ChecklistIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import DeleteModel from "../components/DeleteModel"
import ClearTodos from "../components/ClearTodos"
import DeleteTodoList from "../components/DeleteTodoList"

const Dashboard = () => {

  const [listCount, setListCount] = useState(0)
  const [allTodos, setAllTodos] = useState([])
  const [todo, setTodo] = useState('')
  const [todoError, setTodoError] = useState('')
  const [selectedTodo, setSelectedTodo] = useState(null)

  const [openDeleteModel, setOpenDeleteModel] = useState(false)
  const [todoId, setTodoId] = useState(null)
  const [isClearTodos, setIsClearTodos] = useState(false)
  const [isDeleteTodoList, setIsDeleteTodoList] = useState(false)

  window.electron.ipcRenderer.on('get-list', (e, todos) => {
    setListCount(todos.length)
    const todoFile = todos.find(f => f.selected)
    setSelectedTodo(todoFile)
  })
  
  window.electron.ipcRenderer.on('get-todos', (e, todos) => {
    setAllTodos(todos)
  })

  const deleteTask = (id) => {
    const todos = allTodos.filter(task => task.id !== id)
    setAllTodos(todos)
    window.electron.ipcRenderer.send('add-todos', JSON.stringify(todos, null, 2))
  }

  const changeTaskStatus = (id, status) => {
    const todos = allTodos.map((task) => {
      let obj = task;
      if (obj.id === id) { obj.done = status }
      return obj;
    })
    setAllTodos(todos)
    window.electron.ipcRenderer.send('add-todos', JSON.stringify(todos, null, 2))
  }

  const addTodo = (e) => {
    e.preventDefault()
    if (todo.trim() === '') {
      setTodoError('Task is required.')
      return false;
    }
    let todos = allTodos;
    todos.push({ id: (new Date()).getTime(), text: todo.trim(), done: false })
    setAllTodos(todos)
    window.electron.ipcRenderer.send('add-todos', JSON.stringify(todos, null, 2))
    setTodo('')
  }

  const clearTodoList = () => {
    window.electron.ipcRenderer.send('clear-todos')
    setAllTodos([])
  }

  const deleteTodoList = () => {
    window.electron.ipcRenderer.send('delete-todos')
  }

  useEffect(() => {
    window.electron.ipcRenderer.send('todos')
  }, [selectedTodo])
  

  return (
    <>
      {listCount > 0 ?  <>
        <Grid container>
          <Grid item xs={12} className='m-4'>
            <div className='totle-header'>
              <h3>{selectedTodo?.title} Tasks</h3>
              <span>
                {allTodos.length > 0 && 
                  <ClearIcon
                  className='clear pointer'
                  titleAccess="Clear Todo List"
                  onClick={() => setIsClearTodos(true) }
                />}
                <DeleteIcon
                  className='delete pointer'
                  titleAccess='Delete Todo List'
                  onClick={() => setIsDeleteTodoList(true)}
                />
              </span>
            </div>
          </Grid>
        </Grid>
        <form onSubmit={addTodo} className='full-width'>
          <Grid container>
            <Grid item xs={12} className='m-4'>
              <FormControl variant="standard" fullWidth>
                <Input
                  id="input-with-icon-adornment"
                  placeholder='Add Task'
                  value={todo}
                  onChange={(e) => {
                    setTodo(e.target.value)
                    setTodoError('')
                  }}
                  startAdornment={<InputAdornment position="start"><ChecklistIcon /></InputAdornment>}
                  endAdornment={<Button type='submit'><AddIcon /></Button>}
                />
                <span className='red-span'>{todoError}</span>
              </FormControl>
            </Grid>
          </Grid>
        </form>
        <Grid>
          <Grid item xs={12}>
            <List>
              {allTodos.length > 0? allTodos.map((task, index) =>
                <ListItem key={`task-${index}`} className='full-width flex space-between'>
                  <FormControlLabel
                    className={task.done ? 'strike' : ''}
                    label={task.text}
                    control={<Checkbox
                      checked={task.done}
                      onClick={() => changeTaskStatus(task.id, !task.done)}
                    />}
                  />
                  <Button
                    type='button' variant="contained" color="error"
                    onClick={() => {
                      setOpenDeleteModel(true)
                      setTodoId(task.id)
                      // deleteTask(task.id)
                    }} >Delete</Button>
                </ListItem>
              ): null}
            </List>
          </Grid>
        </Grid>
      </>: <>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          No Tasks Found
        </Typography>
        <Typography variant="h5" component="div">
          No Tasks Found, Create task to get started
        </Typography>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Goto Menu {'>'} New Todo
        </Typography>
      </CardContent>
      </>}

      {/* clearTodoList */}

      {openDeleteModel ?
        <DeleteModel
          handleClose={() => setOpenDeleteModel(false)}
          handleYes={() => {
            setOpenDeleteModel(false)
            deleteTask(todoId)
          }}
        />: null}

      {isClearTodos ? 
        <ClearTodos
          handleClose={() => setIsClearTodos(false)}
          handleYes={() => {
            setIsClearTodos(false)
            clearTodoList()
          }}
        />: null}
      {isDeleteTodoList ?
        <DeleteTodoList
          handleClose={() => setIsDeleteTodoList(false)}
          handleYes={() => {
            setIsDeleteTodoList(false)
            deleteTodoList()
          }}
        />: null}
      
    </>
  )
}

export default Dashboard
