import Sidebar from "../Components/sidebar/Sidebar";
import getConversations from "../action/getConversations";
import getUsers from "../action/getUsers";
import ConversationList from "./components/ConversationList";

export default async function ConversationLayout({
    children
}:{children:React.ReactNode}){
    const conversations = await getConversations();
    const users = await getUsers();
    return(
        
        <Sidebar>
            <div className="h-full">
                <ConversationList
                initialItems={conversations}
                users={users}
                title="Messages"
                />
                {children}
            </div>
        </Sidebar>
    )
}