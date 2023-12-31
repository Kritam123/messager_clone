'use client'
import { useRouter } from "next/navigation"
import React, { useCallback,useMemo } from "react";
import {format} from "date-fns"
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { FullConversationType } from "../../types";
import useotherUser from "../../hooks/useotherUser";
import AvatarGroup from "../../Components/AvatarGroup";
import Avatar from "../../Components/Avatar";

interface ConversationBoxProps{
    data:FullConversationType,
    selected?:boolean,
    conversation:FullConversationType
}
const ConversationBox:React.FC<ConversationBoxProps> = ({data,selected,conversation}) => {
    const router = useRouter();
    const otherUser = useotherUser(data);
    const session = useSession();
  const handleClick = useCallback(()=>{
    router.push(`/conversations/${data.id}`)
  },[data.id,router])
  const lastMessage = useMemo(()=>{
    const messages = data.messages ||  []
    return messages[messages.length - 1 ];
  },[data.messages])
  const userEmail = useMemo(()=>{
    return session.data?.user?.email;
  },[session.data?.user?.email])
  const hasSeen = useMemo(()=>{
      if(!lastMessage){
        return false
      }
      const seenArray = lastMessage.seen || [];
      if(!userEmail){
        return false;
      }
      return seenArray.filter((user)=>userEmail === user.email).length !==0;
  },[userEmail,lastMessage])
  const lastMessageText = useMemo(()=>{
    if(lastMessage?.image){
      return 'Sent an image';
    }
    if(lastMessage?.body){
      return lastMessage.body;
    }
    return "Started a new Conversation";
  },[lastMessage])
  return (
    <div  
    onClick={handleClick}
    className={clsx(`
    w-full 
    relative
    flex 
    items-center
    space-x-3
    hover:bg-neutral-100
    rounded-lg
    transition
    cursor-pointer
    p-3 
    `, selected ?"bg-neutral-100":"bg-white")}
    >
      {conversation?.isGroup? <AvatarGroup users={conversation.users}/>:
      <Avatar user={otherUser}/> 
}
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
            <div className="flex justify-between items-center mb-1">
                <p
                className="text-lg font-medium text-gray-900"
                >
                    {data.name?.length! > 10 ? data.name?.slice(0,10) + "...": data.name|| otherUser.name?.length!>10 ? otherUser.name?.slice(0,10).concat("..."):otherUser.name}
                </p>
                {lastMessage?.createdAt && (
                  <p
                  className="
                  text-xs 
                  text-gray-400
                  font-light
                  
                  "
                  >
                    {format(new Date(lastMessage.createdAt),'p')}
                  </p>
                )}
            </div>
            <p
            className={
              clsx(`truncate text-sm`
              , hasSeen ? "text-gray-500": "text-black font-medium"
              )
            }
            >
              {
                lastMessageText 
              }
            </p>
        </div>
      </div>
    </div>
  )
}

export default ConversationBox