import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { PremiumUpgradeDialog } from '@/components/PremiumUpgradeDialog';
import { useState } from 'react';

export function CustomProblemCreator() {
  const { canCreateCustomProblem, customProblemCount, userPlan } = usePlanRestrictions();
  const { t } = useTranslation();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // カスタム問題作成ボタンのクリックハンドラ
  const handleCreateClick = () => {
    if (canCreateCustomProblem()) {
      // 問題作成ロジックへ
      // ...
    } else {
      // アップグレードダイアログを表示
      setShowUpgradeDialog(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t('customProblems.title')}</h2>
        
        {userPlan === 'standard' && (
          <div className="text-sm text-muted-foreground">
            {t('customProblems.limitInfo', { current: customProblemCount, max: 1 })}
          </div>
        )}
      </div>

      <Button 
        onClick={handleCreateClick}
        disabled={!canCreateCustomProblem() && userPlan === 'standard'}
      >
        {t('customProblems.createButton')}
      </Button>

      {/* アップグレードダイアログ */}
      <PremiumUpgradeDialog 
        open={showUpgradeDialog} 
        onOpenChange={setShowUpgradeDialog} 
        feature={t('common.customProblems')}
      />
    </div>
  );
} 