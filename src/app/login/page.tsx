import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AuthForm from "@/components/AuthForm";

function LoginPage() {
  return (
    <div 
    className="mt-20 flex flex-1 flex-col items-center">
      {/* <h2 className="text-center"> Welcome to login page </h2> */}
      
    <Card className="w-full max-w-md">
            <CardHeader className="mb-4">
                <CardTitle className="text-center text-3xl">LOGIN</CardTitle>
                {/* <CardDescription>Card Description</CardDescription> */}
                {/* <CardAction>Card Action</CardAction> */}
            </CardHeader>

            <AuthForm type="Login" />
{/* 
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter> */}
    </Card>

    </div>
  )
}

export default LoginPage;
