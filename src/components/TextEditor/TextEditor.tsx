import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import { openai } from "@/utils/openai";

const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((module) => module.Editor),
  {
    ssr: false,
  }
);

function TextEditor() {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    const state = convertFromRaw(JSON.parse(localStorage.getItem("data")!));
    setEditorState(EditorState.createWithContent(state));

    /* openai
      .createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Hello!" }],
      })
      .then((result) => {
        console.log(result.data.choices[0].message?.content);
      }); */
  }, []);

  const onEditorStateChange = (editorState: any) => {
    setEditorState(editorState);
    localStorage.setItem(
      "data",
      JSON.stringify(convertToRaw(editorState.getCurrentContent()))
    );
  };

  const handleChange = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      console.log("ENTER");
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen pb-16" onKeyUp={handleChange}>
      <Editor
        toolbarClassName="flex sticky top-0 z-50 !justify-center mx-auto"
        editorClassName="mt-6 p-10 bg-white shadow-md max-w-4xl mx-auto"
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        placeholder="Write your question and press enter to get a response ⤶"
      />
    </div>
  );
}

export default TextEditor;
