import { forwardRef, useEffect, useState, useImperativeHandle } from "react";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, convertFromRaw, Modifier } from "draft-js";
import { openai } from "@/utils/openai";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((module) => module.Editor),
  {
    ssr: false,
  }
);

// eslint-disable-next-line react/display-name
const TextEditor = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    saveDocument() {
      localStorage.setItem(
        "data",
        JSON.stringify(convertToRaw(editorState.getCurrentContent()))
      );
    },
    clearDocument() {
      setEditorState(EditorState.createEmpty());
    },
  }));

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    if (localStorage.getItem("data")) {
      const state = convertFromRaw(JSON.parse(localStorage.getItem("data")!));
      setEditorState(EditorState.createWithContent(state));
    }
  }, []);

  const onEditorStateChange = (editorState: any) => {
    setEditorState(editorState);
  };

  const handleChange = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      setLoading(true);
      const prompt = convertToRaw(editorState.getCurrentContent()).blocks[0]
        .text;

      openai
        .createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: `Give me a fake response for this prompt: ${prompt}`,
            },
          ],
        })
        .then((result) => {
          const response = result.data.choices[0].message?.content;
          const currentContent = editorState.getCurrentContent();

          const selectionState = editorState.getSelection();
          const newEditorState = EditorState.push(
            editorState,
            Modifier.insertText(
              currentContent,
              selectionState,
              response as string
            ),
            "insert-fragment"
          );

          setEditorState(newEditorState);
          setLoading(false);
        });
    }
  };

  return (
    <div className="bg-gray-200 h-full pb-16" onKeyUp={handleChange}>
      <Editor
        toolbarClassName="flex sticky top-0 z-50 !justify-center mx-auto"
        editorClassName="mt-6 p-10 bg-white shadow-md max-w-4xl mx-auto"
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        placeholder="Write your question and press enter to get a response ⤶"
      />
      {loading && (
        <div className="flex justify-center my-3">Loading response...</div>
      )}
    </div>
  );
});

export default TextEditor;
