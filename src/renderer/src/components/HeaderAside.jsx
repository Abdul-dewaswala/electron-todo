/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import React from 'react';
import { 
  Box, Drawer, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText
 } from '@mui/material';
import {
  CloseRounded as CloseRoundedIcon,
  HorizontalRuleRounded as HorizontalRuleRoundedIcon,
  Checklist as ChecklistIcon,
  Add as AddIcon,
  Dehaze as DehazeIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon
} from '@mui/icons-material'
import headerIcon from '../assets/header.png'
import AddTodo from "./AddTodo"

const HeaderAside = () => {
  const [open, setOpen] = React.useState(false);
  const [openTodo, setOpenTodo] = React.useState(false);
  const [fileNames, setFileNames] = React.useState([]);

  window.electron.ipcRenderer.on('get-list', (e, todos) => setFileNames(todos))

  const toggleDrawer = (newOpen) => () => {
    setOpen(!open);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} className="m-top-26">
      <List className='no-padding'>
          <ListItem className='no-padding' onClick={() => setOpenTodo(true)}>
            <ListItemButton>
              <ListItemIcon><AddIcon /></ListItemIcon>
              <ListItemText primary={'New Todo'} />
            </ListItemButton>
          </ListItem>
      </List>
      <Divider />
      <List>
        {fileNames?.map((text, index) => (
          <ListItem
            key={`check-list-${index}`} disablePadding className='no-padding'
            onClick={() => {
              window.electron.ipcRenderer.send('change-list', text.fileName)
            }}
          >
            <ListItemButton>
              <ListItemIcon><ChecklistIcon /></ListItemIcon>
              <ListItemText primary={text.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  React.useEffect(() => {
    window.electron.ipcRenderer.send('task-list')
  }, [])

  return (
    <>
      <header>
        <div className="header">
          <ul>
            <li id="file" onClick={toggleDrawer(true)}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'antiquewhite'
              }}>
                {open?<KeyboardArrowLeftIcon />:
                <DehazeIcon />} Menu
              </span>
            </li>
          </ul>
          <div className="move-dragger">
            <div className='app-title'>
              <img src={headerIcon} />
              <p>Todo App</p>
            </div>
          </div>
          <ul>
            <li onClick={() => window.electron.ipcRenderer.send('minimize')} id="minimize">
              <HorizontalRuleRoundedIcon />
            </li>
            <li onClick={() => window.electron.ipcRenderer.send('quit')} id="close">
              <CloseRoundedIcon />
            </li>
          </ul>
        </div>
      </header>
      <Drawer open={open} onClose={toggleDrawer(false)}>{DrawerList}</Drawer>
      {
        openTodo ? 
        <AddTodo
          handleClose={() => setOpenTodo(false) }
        />:null}
    </>
  )
}

export default HeaderAside
