import React from 'react'
import { Button } from "@/components/ui/button"

const ResultDisplay = ({ score, time, totalQuestions, onRestart }) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-muted p-4 text-center">
        <p className="text-lg font-medium">
          スコア: <span className="text-2xl font-bold">{score}</span> / {totalQuestions}
        </p>
        <p className="text-sm text-muted-foreground">
          所要時間: {time}秒
        </p>
      </div>
      
      <Button 
        onClick={onRestart}
        className="w-32 mx-auto block"
        variant="outline"
      >
        もう一度
      </Button>
    </div>
  )
}

export default ResultDisplay 