import isHotkey from 'is-hotkey'

import React, { useRef,useCallback, useState,useMemo,useEffect } from 'react'
import {
  Editor,
  Element as SlateElement,
  Transforms,
  createEditor,
} from 'slate'
import { withHistory } from 'slate-history'
import { Editable, Slate, useSlate, withReact } from 'slate-react'
import { Button, Icon, Toolbar } from '../components/toolbar.jsx'
import { io } from 'socket.io-client'


import * as Y from 'yjs'
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}
const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export const RichTextExample = () => {
//   const [connected, setConnected] = useState(false)
//   const [sharedType, setSharedType] = useState()
//   const [provider, setProvider] = useState()

//   // Set up your Yjs provider and document
//   useEffect(() => {
//     const yDoc = new Y.Doc()
//     const sharedDoc = yDoc.get('slate', Y.XmlText)

//     // Set up your Yjs provider. This line of code is different for each provider.
//     const yProvider = new YjsProvider(/* ... */)

//     yProvider.on('sync', setConnected)
//     setSharedType(sharedDoc)
//     setProvider(yProvider)

//     return () => {
//       yDoc?.destroy()
//       yProvider?.off('sync', setConnected)
//       yProvider?.destroy()
//     }
//   }, [])

//   if (!connected || !sharedType || !provider) {
//     return <div>Loading…</div>
//   }

//   return <SlateEditor />
// }
// const SlateEditor = () => {

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        }, []);

  const renderElement = useCallback(props => <Element {...props} />, [])
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
    const [value,setValue]=useState(initialValue);
    const [socket,setSocket]=useState();
    const editorRef = useRef()
    if (!editorRef.current) editorRef.current = withReact(createEditor())
    const editor = editorRef.current
  let isRemote = false;

    useEffect(()=>{
        const s=io("http://localhost:3000");
        setSocket(s);
        s.on("connect",()=>{
            console.log("Connected to server");
        })
        return () => {
            s.disconnect();
        }
    },[])

    useEffect(()=>{
      if(value && socket){
          console.log("editor path",editor.selection?.anchor.path);
          console.log("Sending changes:", value);
          socket.emit("send-changes",value);
      
    }},[value,socket,editor])

    // useEffect(() => {
    //   if (socket) {
    //     isRemote= true;
        
    //       isRemote = false;
          
    //     });
    //   }});
    const applyingRemote = useRef(false);

      useEffect(() => {
        const s = io('http://localhost:3000')
        setSocket(s)
        s.on('connect', () => console.log('Connected'))

        s.on('receive-changes', ({ text, path, offset }) => {
          applyingRemote.current = true
          Transforms.insertText(editor, text, { at: { path, offset } })
          applyingRemote.current = false
        })

        return () => s.disconnect()
  }, [editor])
    
  //   const insertedText = (text) => {
  //   setValue(text);

  // const ops = editor.operations;
  // for (const op of ops) {
  //   if (op.type === 'insert_text') {
  //     console.log('Inserted "', op.text, '" at', op.path, op.offset);
  //       applyingRemote = true;
  //     // Emit the insert event to the server
  //     socket.emit('insert-text', {
  //       text: op.text,
  //       path: op.path,
  //       offset: op.offset,
  //     });
  //     socket.on('receive-changes', ({ text, path, offset }) => {
  //     Transforms.insertText(editor, text, {
  //       at: { path, offset },
  //     });
  //     applyingRemote = false;
  //     console.log('Inserted', text, 'at path:', path, 'offset:', offset);
  //   });
  //   }
  // }
// };

// Listener for remote changes, preferably outside of your insert function


        
    
//   setSlate(editor);
  return (
    <Slate 
    editor={editor} 
    initialValue={initialValue}
      onChange={newValue => {
          setValue(newValue)

          // Emit only local inserts
          for (const op of editor.operations) {
            if (op.type === 'insert_text' && !applyingRemote.current) {
              socket.emit('insert-text', {
                text: op.text, path: op.path, offset: op.offset
              })
            }
          }
        }}
    >
      <Toolbar>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <MarkButton format="underline" icon="format_underlined" />
        <MarkButton format="code" icon="code" />
        <BlockButton format="heading-one" icon="looks_one" />
        <BlockButton format="heading-two" icon="looks_two" />
        <BlockButton format="block-quote" icon="format_quote" />
        <BlockButton format="numbered-list" icon="format_list_numbered" />
        <BlockButton format="bulleted-list" icon="format_list_bulleted" />
        <BlockButton format="left" icon="format_align_left" />
        <BlockButton format="center" icon="format_align_center" />
        <BlockButton format="right" icon="format_align_right" />
        <BlockButton format="justify" icon="format_align_justify" />
      </Toolbar>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Enter some rich text…"
        spellCheck
        autoFocus
        
        // onKeyDown={event => {
        //   for (const hotkey in HOTKEYS) {
        //     if (isHotkey(hotkey, event)) {
        //       event.preventDefault()
        //       const mark = HOTKEYS[hotkey]
        //       toggleMark(editor, mark)
        //     }
        //   }
        // }}
      />
    </Slate>
  )
}
const initialValue=[
    {
        type:'paragraph',
        children:[{text:'This is editable rich text, much better than a textarea!'}]
    }
]
const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    isAlignType(format) ? 'align' : 'type'
  )
  const isList = isListType(format)
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isListType(n.type) &&
      !isAlignType(format),
    split: true,
  })
  let newProperties
  if (isAlignType(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes(editor, newProperties)
  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}
const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false
  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => {
        if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
          if (blockType === 'align' && isAlignElement(n)) {
            return n.align === format
          }
          return n.type === format
        }
        return false
      },
    })
  )
  return !!match
}
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}
const Element = ({ attributes, children, element }) => {
  const style = {}
  if (isAlignElement(element)) {
    style.textAlign = element.align
  }
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
}
const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }
  if (leaf.code) {
    children = <code>{children}</code>
  }
  if (leaf.italic) {
    children = <em>{children}</em>
  }
  if (leaf.underline) {
    children = <u>{children}</u>
  }
  return <span {...attributes}>{children}</span>
}
const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        isAlignType(format) ? 'align' : 'type'
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}
const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}
const isAlignType = format => {
  return TEXT_ALIGN_TYPES.includes(format)
}
const isListType = format => {
  return LIST_TYPES.includes(format)
}
const isAlignElement = element => {
  return 'align' in element
}
// const initialValue = [
//   {
//     type: 'paragraph',
//     children: [
//       { text: 'This is editable ' },
//       { text: 'rich', bold: true },
//       { text: ' text, ' },
//       { text: 'much', italic: true },
//       { text: ' better than a ' },
//       { text: '<textarea>', code: true },
//       { text: '!' },
//     ],
//   },
//   {
//     type: 'paragraph',
//     children: [
//       {
//         text: "Since it's rich text, you can do things like turn a selection of text ",
//       },
//       { text: 'bold', bold: true },
//       {
//         text: ', or add a semantically rendered block quote in the middle of the page, like this:',
//       },
//     ],
//   },
//   {
//     type: 'block-quote',
//     children: [{ text: 'A wise quote.' }],
//   },
//   {
//     type: 'paragraph',
//     align: 'center',
//     children: [{ text: 'Try it out for yourself!' }],
//   },
// ]
export default RichTextExample