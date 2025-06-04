import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { dealsApi, DealRule } from "@/services/api/deals";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DealRulesProps {
  dealId: number;
  initialRules?: DealRule[];
  onRulesChange: (rules: DealRule[]) => void;
  disabled?: boolean;
}

export const DealRules = ({
  dealId,
  initialRules = [],
  onRulesChange,
  disabled = false,
}: DealRulesProps) => {
  const { toast } = useToast();
  const [rules, setRules] = useState<DealRule[]>(initialRules);
  const [ruleTypes, setRuleTypes] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newRule, setNewRule] = useState({
    rule_type_id: "",
    value: "",
  });

  useEffect(() => {
    fetchRuleTypes();
  }, []);

  const fetchRuleTypes = async () => {
    try {
      const response: { data: { id: number; name: string }[] } | { data: { data: { id: number; name: string }[] } } = await dealsApi.getDealRuleTypes();
      if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
        setRuleTypes(response.data);
      } else if (response && typeof response === 'object' && 'data' in response && response.data && Array.isArray((response.data as any).data)) {
        setRuleTypes((response.data as any).data);
      } else {
        console.error('Unexpected rule types response format:', response);
        setRuleTypes([]);
      }
    } catch (error) {
      console.error('Failed to load rule types:', error);
      toast({
        title: "Error",
        description: "Failed to load rule types.",
        variant: "destructive",
      });
    }
  };

  const handleAddRule = () => {
    if (!newRule.rule_type_id || !newRule.value) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    // Generate a temporary negative ID for new rules
    const tempId = rules.length > 0 ? Math.min(...rules.map(r => r.id), 0) - 1 : -1;
    const ruleType = ruleTypes.find(rt => rt.id === parseInt(newRule.rule_type_id));
    const newRuleObj = {
      id: tempId,
      deal_id: dealId,
      rule_type_id: parseInt(newRule.rule_type_id),
      rule_type: ruleType || { id: parseInt(newRule.rule_type_id), name: "" },
      value: newRule.value,
    };
    const updatedRules = [...rules, newRuleObj];
    setRules(updatedRules);
    onRulesChange(updatedRules);

    // Reset form
    setNewRule({
      rule_type_id: "",
      value: "",
    });
  };

  const handleDeleteRule = async (ruleId: number) => {
    setIsLoading(true);
    try {
      await dealsApi.deleteDealRule(dealId, ruleId);
      const updatedRules = rules.filter((rule) => rule.id !== ruleId);
      setRules(updatedRules);
      onRulesChange(updatedRules);

      toast({
        title: "Success",
        description: "Rule deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rule.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Add new rule form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rule_type">Rule Type</Label>
              <Select
                value={newRule.rule_type_id}
                onValueChange={(value) =>
                  setNewRule((prev) => ({ ...prev, rule_type_id: value }))
                }
                disabled={disabled || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select rule type" />
                </SelectTrigger>
                <SelectContent>
                  {ruleTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule_value">Value</Label>
              <Input
                id="rule_value"
                value={newRule.value}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, value: e.target.value }))
                }
                disabled={disabled || isLoading}
              />
            </div>
          </div>

          <Button
            className="mt-4"
            onClick={(e) => {
              e.preventDefault();
              handleAddRule();
            }}
            type="button"
            disabled={disabled || isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </CardContent>
      </Card>

      {/* Existing rules */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <p className="text-gray-500">No rules added yet</p>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {rule.rule_type?.name || "Unknown Rule Type"}
                    </p>
                    <p className="text-sm text-gray-500">{rule.value}</p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteRule(rule.id)}
                    disabled={disabled || isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 