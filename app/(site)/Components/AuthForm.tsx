"use client";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import AuthSocialButton from "./AuthSocialButton";
import { toast } from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Input from "../../Components/Inputs/Input";
import Button from "../../Components/Button";
type Variant = "Login" | "Register";
const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("Login");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (session?.status === "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVarient = useCallback(() => {
    if (variant === "Login") {
      setVariant("Register");
    } else {
      setVariant("Login");
    }
  }, [variant]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setLoading(true);
    if (variant === "Login") {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid credentials");
          }
          if (callback?.ok && !callback?.error) {
            toast.success("Logged In");
            router.push("/users")
          }
        })
        .finally(() => setLoading(false));
    }
    if (variant === "Register") {
      axios
        .post("/api/register", data).then(()=>signIn('credentials',data))
        .catch(() => toast.error("Something went wrong!"))
        .finally(() => setLoading(false));
    }
  };
  const socialAction = (action: string) => {
    setLoading(true);
    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials");
        }
        if (callback?.ok && !callback?.error) {
          toast.success("Logged In");
          router.push('/users')
        }
      })
      .finally(() => setLoading(false));
  };
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "Register" && (
            <Input
              id="name"
              label="Name"
              register={register}
              disabled={loading}
              errors={errors}
            />
          )}
          <Input
            id="email"
            label="Email Address"
            type="email"
            disabled={loading}
            register={register}
            errors={errors}
          />
          <Input
            id="password"
            disabled={loading}
            label="Password"
            type="password"
            register={register}
            errors={errors}
          />
          <div>
            <Button type="submit" fullWidth disabled={loading}>
              {variant === "Login" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 "></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                or continue with
              </span>
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>
            {variant === "Login"
              ? "New to Messager?"
              : "Already Have an Account?"}
          </div>
          <div onClick={toggleVarient} className="underline cursor-pointer">
            {variant === "Login" ? "Create a New Account" : "SignIn"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
