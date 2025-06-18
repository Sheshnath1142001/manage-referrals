import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useGetRestaurants } from "@/hooks/useGetRestaurants";
import { Pagination } from "@/components/ui/pagination";
import { EditComboProductDialog } from "@/components/EditComboProductDialog";
import { AddComboProductDialog } from "@/components/deals/AddComboProductDialog";

const PAGE_SIZE = 10;
const API_BASE_URL = import.meta.env.API_BASE_URL;

const RestaurantProducts = () => {
  const [search, setSearch] = useState("");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("1");
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { restaurants, isLoading: isLoadingRestaurants } = useGetRestaurants();
  const [isLoading, setIsLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    if (restaurants && restaurants.length > 0 && !selectedRestaurantId) {
      setSelectedRestaurantId(Number(restaurants[0].id));
    }
  }, [restaurants, selectedRestaurantId]);

  const fetchProducts = () => {
    if (!selectedRestaurantId) return;
    setIsLoading(true);
    fetch(
      `${API_BASE_URL}/v2/products/combo-products?offset=${(page - 1) * PAGE_SIZE}&limit=${PAGE_SIZE}&restaurant_id=${selectedRestaurantId}&status=${status}`
    )
      .then((res) => res.json())
      .then((json) => {
        setProducts(json.data || []);
        setTotal(json.pagination?.total || 0);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedRestaurantId, status, page]);

  const filteredProducts = search
    ? products.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);
  const handleLocation = (value: string) => setSelectedRestaurantId(Number(value));
  const handleStatus = (value: string) => setStatus(value);
  const handlePageChange = (newPage: number) => setPage(newPage);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Combo Products</h1>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="w-48">
          <Select value={selectedRestaurantId?.toString()} onValueChange={handleLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {restaurants?.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-48">
          <Select value={status} onValueChange={handleStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Active</SelectItem>
              <SelectItem value="0">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Online Price</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No combo products found</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>${Number(row.price).toFixed(2)}</TableCell>
                  <TableCell>${Number(row.online_price).toFixed(2)}</TableCell>
                  <TableCell>
                    {row.items
                      .map(
                        (item) =>
                          `${item.min_quantity} ${item.categories
                            .map((c) => c.name)
                            .join(",")} ${item.max_quantity > 1 ? `- ${item.max_quantity}` : ""}`
                      )
                      .join(" and ")}
                  </TableCell>
                  <TableCell>
                    <span className={row.status === 1 ? 'text-green-600' : 'text-gray-600'}>
                      {row.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedProduct(row); setEditDialogOpen(true); }}>
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <Pagination
          totalItems={total}
          pageSize={PAGE_SIZE}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      </div>
      
      <EditComboProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
        onSuccess={() => {
          fetchProducts();
          setSelectedProduct(null);
          setEditDialogOpen(false);
        }}
        restaurantId={selectedRestaurantId || 0}
      />

      <AddComboProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => {
          fetchProducts();
          setAddDialogOpen(false);
        }}
        restaurantId={selectedRestaurantId || 0}
      />
    </div>
  );
};

export default RestaurantProducts; 