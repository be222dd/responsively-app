import React, {useRef, useState, useEffect} from 'react';
import {ipcRenderer} from 'electron';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

export default function HttpAuthDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState(false)
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    const handler = (event, args) => {
      setUrl(args.url);
      setOpen(true);
    };
    const authHandler = (event, args) => {
      if(status){
        ipcRenderer.send('http-auth-promt-response', {
          url:args.url,
          username,
          password,
        });
      }else{
        ipcRenderer.send('http-auth-promt-response', {url:args.url});
      }
      
    };
    ipcRenderer.on('http-auth-prompt', handler);
    ipcRenderer.on('do-basic-auth', authHandler);
    return () => {
      ipcRenderer.removeListener('http-auth-prompt', handler);
      ipcRenderer.removeListener('do-basic-auth', authHandler);
    };
  }, []);

  function handleClose(status) {
    setUsername(usernameRef.current.querySelector('input').value)
    setPassword(passwordRef.current.querySelector('input').value)
    if (!status) {
      ipcRenderer.send('http-auth-promt-response', {url});
    }else{
    setStatus(true)
    ipcRenderer.send('http-auth-promt-response', {
      url,
      username,
      password,
    });
    }
    setOpen(false);
  }

  return (
    <div>
      <Dialog
        open={open}
        
        disableBackdropClick={true}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Sign-in</DialogTitle>
       
          <DialogContent>
            <DialogContentText>
              {url ? <strong>{url}</strong> : 'The webpage'} requires HTTP Basic
              authentication to connect, please enter the details to continue.
            </DialogContentText>

            <TextField
              ref={usernameRef}
              autoFocus
              margin="dense"
              id="username"
              label="Username"
              type="text"
              fullWidth
            />
            <TextField
              ref={passwordRef}
              margin="dense"
              id="password"
              label="Password"
              type="password"
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => handleClose(false)} color="secondary" type="submit" variant="contained">
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={() => handleClose(true)}
              color="primary"
              type="submit"
            >
              Sign In
            </Button>
          </DialogActions>
       
      </Dialog>
    </div>
  );
}
