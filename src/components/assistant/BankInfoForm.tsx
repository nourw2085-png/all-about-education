
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Banknote } from 'lucide-react';

const BankInfoForm = () => {
  const { user, updateUserBankNumber } = useAuth();
  const [bankNumber, setBankNumber] = useState(user?.bankNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bankNumber || bankNumber.length < 10) {
      toast({
        title: "Error",
        description: "Please enter a valid bank account number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      if (updateUserBankNumber) {
        updateUserBankNumber(bankNumber);
      }
      
      toast({
        title: "Success",
        description: "Your bank information has been updated"
      });
      
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Banknote className="mr-2 h-5 w-5 text-edu-purple-600" />
          Banking Information
        </CardTitle>
        <CardDescription>
          Update your bank account information to receive payments
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="bankNumber">Bank Account Number</Label>
            <Input
              id="bankNumber"
              placeholder="Enter your bank account number"
              value={bankNumber}
              onChange={(e) => setBankNumber(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-edu-purple-600 hover:bg-edu-purple-700"
          >
            {isSubmitting ? "Updating..." : "Update Bank Information"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default BankInfoForm;
