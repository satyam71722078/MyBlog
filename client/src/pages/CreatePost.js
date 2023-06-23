import { useState } from 'react';
import {Navigate} from 'react-router-dom';
import Editor from '../components/Editor';

export default function CreatePost() {

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState('')
  const [redirect, setRedirect] = useState(false)

  async function createNewPost(ev){
    ev.preventDefault();

    const data = new FormData();
      data.set('title', title);
      data.set('summary', summary);
      data.set('content', content);
      data.set('file', files[0]);

      const response = await fetch('http://localhost:4000/post',{
        method: 'POST',
        body: data,
        credentials: 'include'
      })

      if(response.ok){
        setRedirect(true);
      }
      
  }

  if(redirect){
    alert('Post created successfully');
    return <Navigate to="/"/>
  }

  return (
    <form onSubmit={createNewPost}>
      <input required={true} type="title" placeholder="title"  value={title} onChange={ev => setTitle(ev.target.value)}/>
      <input required={true}  type="summary" placeholder="summary" value={summary} onChange={ev => setSummary(ev.target.value)}/>
      <input required={true}  type="file" onChange={ev => setFiles(ev.target.files)}/>
      <Editor value={content} onChange={setContent}/>
      <button style={{marginTop:'5px'}}>Create Post</button>
    </form>
  )
}
