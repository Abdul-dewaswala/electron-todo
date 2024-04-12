/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
import * as React from 'react'
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Slide
} from '@mui/material'

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default function ClearTodos({ handleClose, handleYes }) {

  return (
    <Dialog
      open={true} TransitionComponent={Transition} keepMounted onClose={handleClose}
			aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>{"Are you sure?"}</DialogTitle>
      <DialogContent>
				<p>
					Are you sure you want to clear all tasks?
				</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>No</Button>
        <Button onClick={handleYes}>Yes</Button>
      </DialogActions>
    </Dialog>
  )
}
