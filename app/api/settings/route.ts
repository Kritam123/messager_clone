import { NextResponse } from "next/server";
import getCurrentUser from "../../action/getCurrentUser";
export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    const { name, image } = await req.json();
    if (!currentUser) {
      return new NextResponse("Unathorised Access", { status: 401 });
    }
    const updatedUser = await prisma?.user.update({
        where:{
            id:currentUser.id
        },
        data:{
            name,
            image
        }
    })
    return NextResponse.json(updatedUser,{status:201});
  } catch (error) {
    console.log("Setting_Api_Error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
