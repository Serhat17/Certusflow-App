'use client';

import {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Checkbox} from '@/components/ui/checkbox';
import {Label} from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  INTEGRATION_PERMISSIONS,
  getRequiredPermissions,
  getDefaultPermissions,
  type PermissionGroup
} from '@/lib/integrations/permissions';
import {Shield, Lock, Eye, Edit, AlertCircle} from 'lucide-react';

interface PermissionSelectorProps {
  integrationType: string;
  integrationName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedPermissions: string[]) => void;
  existingPermissions?: string[];
}

export default function PermissionSelector({
  integrationType,
  integrationName,
  open,
  onOpenChange,
  onConfirm,
  existingPermissions
}: PermissionSelectorProps) {
  const permissionGroups = INTEGRATION_PERMISSIONS[integrationType] || [];
  const requiredPermissions = getRequiredPermissions(integrationType);
  
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    existingPermissions || getDefaultPermissions(integrationType)
  );

  useEffect(() => {
    if (existingPermissions) {
      setSelectedPermissions(existingPermissions);
    }
  }, [existingPermissions]);

  const togglePermission = (permissionId: string, isRequired: boolean) => {
    if (isRequired) return; // Can't toggle required permissions

    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const getCategoryIcon = (category: 'read' | 'write' | 'admin') => {
    switch (category) {
      case 'read':
        return <Eye className="h-4 w-4" />;
      case 'write':
        return <Edit className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: 'read' | 'write' | 'admin') => {
    switch (category) {
      case 'read':
        return 'text-blue-500';
      case 'write':
        return 'text-orange-500';
      case 'admin':
        return 'text-red-500';
    }
  };

  const handleConfirm = () => {
    // Always include required permissions
    const finalPermissions = [...new Set([...selectedPermissions, ...requiredPermissions])];
    onConfirm(finalPermissions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Berechtigungen für {integrationName}
          </DialogTitle>
          <DialogDescription>
            Wählen Sie, welche Berechtigungen CertusFlow für {integrationName} haben soll.
            Sie können diese Einstellungen jederzeit ändern.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Ihre Daten bleiben sicher</p>
                  <p className="text-blue-700">
                    Alle Berechtigungen mit <Lock className="h-3 w-3 inline" /> sind erforderlich, damit die
                    Integration funktioniert. Optionale Berechtigungen können Sie frei wählen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permission Groups */}
          {permissionGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                {group.name}
              </h3>
              
              <div className="space-y-2">
                {group.permissions.map((permission) => {
                  const isRequired = permission.required;
                  const isSelected = selectedPermissions.includes(permission.id) || isRequired;

                  return (
                    <Card
                      key={permission.id}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/30'
                      } ${isRequired ? 'bg-muted/50' : ''}`}
                      onClick={() => togglePermission(permission.id, isRequired)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            disabled={isRequired}
                            onCheckedChange={() => togglePermission(permission.id, isRequired)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Label
                                className={`font-medium cursor-pointer ${
                                  isRequired ? 'text-muted-foreground' : ''
                                }`}
                              >
                                {permission.name}
                              </Label>
                              {isRequired && (
                                <Badge variant="secondary" className="text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Erforderlich
                                </Badge>
                              )}
                              <div
                                className={`flex items-center gap-1 text-xs ${getCategoryColor(
                                  permission.category
                                )}`}
                              >
                                {getCategoryIcon(permission.category)}
                                <span className="capitalize">{permission.category}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-medium mb-1">
                    {selectedPermissions.length} Berechtigung(en) ausgewählt
                  </p>
                  <p className="text-green-700">
                    Davon {requiredPermissions.length} erforderlich und{' '}
                    {selectedPermissions.filter(id => !requiredPermissions.includes(id)).length}{' '}
                    optional
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleConfirm}>
            Berechtigungen bestätigen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
