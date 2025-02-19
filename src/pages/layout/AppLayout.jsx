import MainLayout from "@/components/layout/MainLayout"
import { Outlet } from "react-router-dom"

export default function AppLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
