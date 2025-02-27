import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import MathTable from "@/components/MathTable"
import { Skeleton } from "@/components/ui/skeleton"

function Lesson() {
  const { loading } = useContext(AuthContext)

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="space-y-4">
          <div className="grid grid-cols-10 gap-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
          {[...Array(9)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-10 gap-2">
              {[...Array(10)].map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-16 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <MathTable />
    </>
  )
}

export default Lesson
