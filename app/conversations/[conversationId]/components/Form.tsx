"use client";

import useConversation from "@/app/hooks/useConversation";
import axios from "axios";
import { FieldValues, useForm, SubmitHandler } from "react-hook-form";
import { HiPhoto, HiPaperAirplane } from "react-icons/hi2";
import {CldUploadButton} from 'next-cloudinary'
import MessageInput from "./MessageInput";

const Form = () => {
  const { conversationId } = useConversation();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      message: "",
    },
  });
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setValue("message", "", { shouldValidate: true });
    axios.post("/api/messages", {
      ...data,
      conversationId,
    });
  };
  const handlUpload = (result:any)=>{
     axios.post("/api/messages",{
      image:result?.info?.secure_url,
      conversationId,
    })
  }
  return (
    <div className="px-4 py-4 bg-white border-t flex items-center gap-2 lg:gap-4 w-full">
      <CldUploadButton
      options={{maxFiles:1}}
      onUpload={handlUpload}
      uploadPreset="g0bwbduv"
      >
      <HiPhoto className="text-sky-500" size={30} />
      </CldUploadButton>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 lg:gap-4 w-full "
      >
        <MessageInput
        id = "message"
        register = {register}
        errors={errors}
        type="message"
        required
        placeholder = "Write a message..."
        />
        <button type="submit" className="rounded-full p-2 hover:bg-sky-600 bg-sky-500 cursor-pointer transition">
          <HiPaperAirplane size={20} className="text-white "/>
        </button>
      </form>
    </div>
  );
};

export default Form;
