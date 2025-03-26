import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { LineChart, PenSquare, Timer } from 'lucide-react';
import { startSubscription } from '@/lib/subscription';
import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/components/ui/use-toast';
import { useContext } from 'react';
import { AuthContext } from '@/context/AuthProvider';

// Stripeの初期化
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export function PremiumUpgradeDialog({ open, onOpenChange }) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  
  const handleUpgrade = async () => {
    if (isLoading) return; // ダブルクリック防止
    
    try {
      setIsLoading(true);
      const sessionId = await startSubscription();
      if (sessionId) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('アップグレードエラー:', error);
      toast({
        title: t('error'),
        description: error.message || t('upgradeFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full"
        >
          {t('upgradeToPremium')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('premiumFeatures')}</DialogTitle>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <LineChart className="h-5 w-5 text-primary" />
              <span>{t('premiumFeature1')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <PenSquare className="h-5 w-5 text-primary" />
              <span>{t('premiumFeature2')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-primary" />
              <span>{t('premiumFeature3')}</span>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold mb-2">{t('premiumPrice')}</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>{t('premiumPriceDetail1')}</li>
                <li>{t('premiumPriceDetail2')}</li>
              </ul>
            </div>
            <div className="mt-6">
              <Button 
                onClick={handleUpgrade} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('upgrading') : t('upgradeToPremium')}
              </Button>
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

PremiumUpgradeDialog.propTypes = {
  open: PropTypes.bool,
  onOpenChange: PropTypes.func,
}; 