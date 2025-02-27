// Login.jsx
import { useContext, useEffect } from "react";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // userが存在する場合、ホーム画面にリダイレクト
    if (user) {
      navigate("/"); // ログイン成功後、ホーム画面にリダイレクト
    }
  }, [user, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            100マス計算
          </CardTitle>
          <CardDescription className="text-center">
            Googleアカウントでログインして始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Button 
            onClick={handleLogin}
            className="w-full"
            variant="outline"
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
              ></path>
            </svg>
            Googleでログイン
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                100マス計算で計算力アップ
              </span>
            </div>
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground">
            基礎的な計算力を楽しく身につけられる、シンプルで効果的な学習ツールです。
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
