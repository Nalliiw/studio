'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { generateMotivationalMessage } from '@/ai/flows/generate-motivational-message';
import type { User } from '@/types'; // Assuming User type is available
import { useAuth } from '@/hooks/useAuth'; // To get patient name

export default function MotivationalMessageCard() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchMotivationalMessage = async () => {
    if (!user) return;

    setIsLoading(true);
    setError('');
    try {
      const patientName = user.name || 'Paciente';
      // Mock data for now, ideally this would come from patient profile or context
      const patientGoal = 'manter uma alimentação saudável e equilibrada'; 
      const nutritionistName = 'seu nutricionista';

      const result = await generateMotivationalMessage({
        patientName,
        patientGoal,
        nutritionistName,
      });
      setMessage(result.motivationalMessage);
    } catch (err) {
      console.error('Failed to generate motivational message:', err);
      setError('Não foi possível gerar uma mensagem no momento. Tente novamente.');
      setMessage(''); // Clear previous message on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMotivationalMessage();
  }, [user]); // Fetch on initial load or when user changes

  return (
    <Card className="w-full shadow-lg bg-gradient-to-br from-primary/10 to-background">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Sparkles className="mr-2 h-6 w-6 text-primary" />
          Sua Dose de Motivação
        </CardTitle>
        <CardDescription>Uma mensagem especial para inspirar seu dia!</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[100px] flex flex-col justify-center items-center">
        {isLoading && (
          <div className="flex items-center text-muted-foreground">
            <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
            Gerando sua mensagem...
          </div>
        )}
        {!isLoading && message && (
          <p className="text-center text-lg font-medium leading-relaxed text-foreground">
            "{message}"
          </p>
        )}
        {!isLoading && error && (
          <p className="text-center text-destructive">{error}</p>
        )}
        {!isLoading && !message && !error && (
            <p className="text-center text-muted-foreground">Clique para gerar uma nova mensagem.</p>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end">
        <Button onClick={fetchMotivationalMessage} disabled={isLoading} variant="ghost" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Nova Mensagem
        </Button>
      </CardFooter>
    </Card>
  );
}
