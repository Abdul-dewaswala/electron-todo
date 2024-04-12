/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import * as React from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide, Input, InputAdornment, FormControl
} from '@mui/material'
import { Checklist as ChecklistIcon } from '@mui/icons-material'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function AddTodo({ handleClose }) {

  const [todo, setTodo] = React.useState('')
  const [todoError, setTodoError] = React.useState('')

  const addTodo = async (e) => {
    e.preventDefault();
    if(todo.trim() === '') {
      setTodoError('Todo List name is required')
      return false;
    }
    window.electron.ipcRenderer.send('add-to-list', todo)
    window.electron.ipcRenderer.send('task-list')
    handleClose()
  }

  return (
    <Dialog
      open={true} TransitionComponent={Transition} keepMounted onClose={handleClose}
			aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Create new Todo List!"}</DialogTitle>
      <DialogContent>
        <form onSubmit={addTodo}>
          <FormControl variant="standard" fullWidth>
            <Input
              id="input-with-icon-adornment"
              placeholder='Add Todo'
              value={todo}
              onChange={(e) => {
                setTodo(e.target.value)
                setTodoError('')
              }}
              startAdornment={<InputAdornment position="start"><ChecklistIcon /></InputAdornment>}
            />
            <span className='red-span'>{todoError}</span>
          </FormControl>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={addTodo}>Add</Button>
      </DialogActions>
    </Dialog>
  )
}
