import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { API_BASE_URL } from '../../api-config';
import { formatCurrency } from '../../lib/currency-config';

interface Asset {
  id: string;
  name: string;
  type: string;
  currentValue: number;
  purchasePrice: number;
  purchaseDate: string;
  description?: string;
}

interface AssetManagerProps {
  accessToken: string;
  assets: Asset[];
  onRefresh: () => void;
}

const ASSET_TYPES = [
  'Real Estate',
  'Vehicle',
  'Stocks',
  'Mutual Funds',
  'Cryptocurrency',
  'Savings Account',
  'Fixed Deposit',
  'Gold/Jewelry',
  'Bonds',
  'Other',
];

export function AssetManager({ accessToken, assets, onRefresh }: AssetManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    currentValue: '',
    purchasePrice: '',
    purchaseDate: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assetData = {
        name: formData.name,
        type: formData.type,
        currentValue: parseFloat(formData.currentValue),
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        description: formData.description,
      };

      const url = editingAsset
        ? `${API_BASE_URL}/assets/${editingAsset.id}`
        : `${API_BASE_URL}/assets`;

      const response = await fetch(url, {
        method: editingAsset ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error('Failed to save asset');
      }

      onRefresh();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving asset:', error);
      alert('Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/assets/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      onRefresh();
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      currentValue: asset.currentValue.toString(),
      purchasePrice: asset.purchasePrice.toString(),
      purchaseDate: asset.purchaseDate,
      description: asset.description || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      currentValue: '',
      purchasePrice: '',
      purchaseDate: '',
      description: '',
    });
    setEditingAsset(null);
  };

  const totalValue = assets.reduce((sum, asset) => sum + asset.currentValue, 0);
  const totalInvested = assets.reduce((sum, asset) => sum + asset.purchasePrice, 0);
  const totalGain = totalValue - totalInvested;
  const gainPercentage = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Asset Management</CardTitle>
              <CardDescription>Track and monitor your asset portfolio</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
                  <DialogDescription>
                    {editingAsset ? 'Update asset details' : 'Enter the details of your asset'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Asset Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Apple Stock, House, Gold"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Asset Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchasePrice">Purchase Price</Label>
                      <Input
                        id="purchasePrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currentValue">Current Value</Label>
                      <Input
                        id="currentValue"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.currentValue}
                        onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Purchase Date</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      placeholder="Additional details about this asset"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : editingAsset ? 'Update' : 'Add'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValue)}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Invested</p>
              <p className="text-2xl font-bold text-gray-700">{formatCurrency(totalInvested)}</p>
            </div>
            <div className={`p-4 rounded-lg ${totalGain >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600 mb-1">Total Gain/Loss</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(totalGain))}
                </p>
                {totalGain >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className={`text-xs ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}{gainPercentage}%
              </p>
            </div>
          </div>

          {/* Asset List */}
          <div className="space-y-4">
            {assets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No assets found</p>
                <p className="text-sm">Add your first asset to start tracking</p>
              </div>
            ) : (
              assets
                .sort((a, b) => b.currentValue - a.currentValue)
                .map((asset) => {
                  const gain = asset.currentValue - asset.purchasePrice;
                  const gainPercent = ((gain / asset.purchasePrice) * 100).toFixed(2);

                  return (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{asset.name}</h4>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {asset.type}
                          </span>
                        </div>
                        {asset.description && (
                          <p className="text-sm text-gray-600 mt-1">{asset.description}</p>
                        )}
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Purchased:</span> {formatCurrency(asset.purchasePrice)}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(asset.purchaseDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`flex items-center gap-2 mt-2 ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {gain >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="text-sm font-medium">
                            {gain >= 0 ? '+' : ''}{formatCurrency(Math.abs(gain))} ({gain >= 0 ? '+' : ''}{gainPercent}%)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Current Value</p>
                          <p className="font-bold text-xl">{formatCurrency(asset.currentValue)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(asset)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
