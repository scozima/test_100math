import { usePlanRestrictions } from '@/hooks/usePlanRestrictions';
import { PremiumUpgradeDialog } from '@/components/PremiumUpgradeDialog';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Analytics() {
  const { canAccessAnalytics } = usePlanRestrictions();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { t } = useTranslation();

  // プレミアムユーザーでない場合はアップグレードダイアログを表示
  if (!canAccessAnalytics()) {
    return (
      <div className="p-6 border rounded-lg bg-muted/20">
        <h2 className="text-xl font-bold mb-4">{t('analytics.title')}</h2>
        <p className="text-muted-foreground mb-4">
          {t('analytics.premiumFeature')}
        </p>
        <Button onClick={() => setShowUpgradeDialog(true)}>
          {t('common.upgradeToPremium')}
        </Button>

        <PremiumUpgradeDialog 
          open={showUpgradeDialog} 
          onOpenChange={setShowUpgradeDialog}
          feature={t('common.analytics')}
        />
      </div>
    );
  }

  // 分析機能の実装（プレミアムユーザー向け）
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t('analytics.title')}</h2>
      {/* 分析コンテンツ */}
    </div>
  );
} 