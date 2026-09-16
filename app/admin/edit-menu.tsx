import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Plus,
  Edit3,
  Trash2,
  Save,
  DollarSign,
  Star,
} from 'lucide-react-native';
import { Stack } from 'expo-router';
import { MenuCategory, MenuItem } from '@/types/restaurant';
import { useMyRestaurant, useUpdateRestaurant } from '@/hooks/use-restaurants';
import { confirmAction } from '@/lib/confirm';

export default function EditMenu() {
  const { data: restaurant, isLoading, error } = useMyRestaurant();
  const updateRestaurant = useUpdateRestaurant();

  const [menu, setMenu] = useState<MenuCategory[] | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant) {
      setMenu(restaurant.menu);
    }
  }, [restaurant]);

  const handleSave = () => {
    if (!menu || !restaurant) return;

    updateRestaurant.mutate(
      { id: restaurant.id, updates: { menu } },
      {
        onSuccess: () => Alert.alert('Success', 'Menu updated successfully!'),
        onError: (err) => Alert.alert('Save failed', err instanceof Error ? err.message : 'Please try again.'),
      }
    );
  };

  const addCategory = () => {
    const newCategory: MenuCategory = {
      id: `category-${Date.now()}`,
      name: 'New Category',
      description: '',
      items: [],
    };
    setMenu(prev => prev && [...prev, newCategory]);
    setEditingCategory(newCategory.id);
  };

  const updateCategory = (categoryId: string, field: keyof MenuCategory, value: string) => {
    setMenu(prev => prev && prev.map(cat =>
      cat.id === categoryId ? { ...cat, [field]: value } : cat
    ));
  };

  const deleteCategory = (categoryId: string) => {
    confirmAction(
      'Delete Category',
      'Are you sure you want to delete this category and all its items?',
      () => setMenu(prev => prev && prev.filter(cat => cat.id !== categoryId)),
      'Delete'
    );
  };

  const addItem = (categoryId: string) => {
    const newItem: MenuItem = {
      id: `item-${Date.now()}`,
      name: 'New Item',
      description: '',
      price: '0',
    };

    setMenu(prev => prev && prev.map(cat =>
      cat.id === categoryId
        ? { ...cat, items: [...cat.items, newItem] }
        : cat
    ));
    setEditingItem(newItem.id);
  };

  const updateItem = (categoryId: string, itemId: string, field: keyof MenuItem, value: any) => {
    setMenu(prev => prev && prev.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, [field]: value } : item
            )
          }
        : cat
    ));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    confirmAction(
      'Delete Item',
      'Are you sure you want to delete this menu item?',
      () => setMenu(prev => prev && prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter(item => item.id !== itemId) }
          : cat
      )),
      'Delete'
    );
  };

  const toggleItemPopular = (categoryId: string, itemId: string) => {
    setMenu(prev => prev && prev.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, popular: !item.popular } : item
            )
          }
        : cat
    ));
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Menu', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#00BCD4" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Menu', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Couldn't load restaurant data. Pull down to retry or check your connection.</Text>
        </View>
      </>
    );
  }

  if (!restaurant || !menu) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Menu', headerStyle: { backgroundColor: '#00BCD4' }, headerTintColor: '#fff' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No restaurant is linked to your account yet. Contact support to get set up.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Menu',
          headerStyle: { backgroundColor: '#00BCD4' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              style={styles.saveButton}
              disabled={updateRestaurant.isPending}
              accessibilityRole="button"
              accessibilityLabel="Save menu changes"
            >
              {updateRestaurant.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Save size={20} color="#fff" />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        {menu.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            {/* Category Header */}
            <View style={styles.categoryHeader}>
              {editingCategory === category.id ? (
                <View style={styles.editingCategory}>
                  <TextInput
                    style={styles.categoryNameInput}
                    value={category.name}
                    onChangeText={(text) => updateCategory(category.id, 'name', text)}
                    onBlur={() => setEditingCategory(null)}
                    autoFocus
                  />
                  <TextInput
                    style={styles.categoryDescInput}
                    value={category.description || ''}
                    onChangeText={(text) => updateCategory(category.id, 'description', text)}
                    placeholder="Category description (optional)"
                    multiline
                  />
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.categoryInfo}
                  onPress={() => setEditingCategory(category.id)}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                  {category.description && (
                    <Text style={styles.categoryDescription}>{category.description}</Text>
                  )}
                </TouchableOpacity>
              )}
              
              <View style={styles.categoryActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setEditingCategory(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${category.name} category`}
                >
                  <Edit3 size={16} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => deleteCategory(category.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${category.name} category`}
                >
                  <Trash2 size={16} color="#FF5252" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.itemsContainer}>
              {category.items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  {editingItem === item.id ? (
                    <View style={styles.editingItem}>
                      <TextInput
                        style={styles.itemNameInput}
                        value={item.name}
                        onChangeText={(text) => updateItem(category.id, item.id, 'name', text)}
                        placeholder="Item name"
                      />
                      <TextInput
                        style={styles.itemDescInput}
                        value={item.description || ''}
                        onChangeText={(text) => updateItem(category.id, item.id, 'description', text)}
                        placeholder="Item description"
                        multiline
                      />
                      <View style={styles.itemPriceRow}>
                        <DollarSign size={16} color="#666" />
                        <TextInput
                          style={styles.itemPriceInput}
                          value={item.price}
                          onChangeText={(text) => updateItem(category.id, item.id, 'price', text)}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                      </View>
                      <TouchableOpacity
                        style={styles.doneButton}
                        onPress={() => setEditingItem(null)}
                      >
                        <Text style={styles.doneButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={styles.itemInfo}
                      onPress={() => setEditingItem(item.id)}
                    >
                      <View style={styles.itemHeader}>
                        <View style={styles.itemTitleRow}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {item.popular && (
                            <View style={styles.popularBadge}>
                              <Star size={12} color="#FF9800" />
                              <Text style={styles.popularText}>Popular</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.itemPrice}>
                          {typeof item.price === 'string' && /^\$|market price|ask your server/i.test(item.price)
                            ? item.price
                            : `$${item.price}`}
                        </Text>
                      </View>
                      {item.description && (
                        <Text style={styles.itemDescription}>{item.description}</Text>
                      )}
                      {item.dietaryTags && item.dietaryTags.length > 0 && (
                        <View style={styles.dietaryTags}>
                          {item.dietaryTags.map((tag) => (
                            <View key={tag} style={styles.dietaryTag}>
                              <Text style={styles.dietaryTagText}>{tag}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </TouchableOpacity>
                  )}
                  
                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={[
                        styles.popularButton,
                        item.popular && styles.popularButtonActive
                      ]}
                      onPress={() => toggleItemPopular(category.id, item.id)}
                      accessibilityRole="checkbox"
                      accessibilityLabel="Mark as popular"
                      accessibilityState={{ checked: item.popular }}
                    >
                      <Star size={16} color={item.popular ? '#FF9800' : '#666'} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setEditingItem(item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${item.name}`}
                    >
                      <Edit3 size={16} color="#666" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => deleteItem(category.id, item.id)}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete ${item.name}`}
                    >
                      <Trash2 size={16} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => addItem(category.id)}
              >
                <Plus size={20} color="#00BCD4" />
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addCategoryButton} onPress={addCategory}>
          <Plus size={24} color="#fff" />
          <Text style={styles.addCategoryText}>Add Category</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
  },
  categoryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  editingCategory: {
    flex: 1,
  },
  categoryNameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#00BCD4',
    paddingVertical: 4,
    marginBottom: 8,
  },
  categoryDescInput: {
    fontSize: 14,
    color: '#666',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  itemsContainer: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  popularBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  popularText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00BCD4',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dietaryTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dietaryTagText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  editingItem: {
    flex: 1,
    gap: 8,
  },
  itemNameInput: {
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#00BCD4',
    paddingVertical: 4,
  },
  itemDescInput: {
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 4,
    minHeight: 40,
  },
  itemPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemPriceInput: {
    fontSize: 16,
    fontWeight: '600',
    borderBottomWidth: 1,
    borderBottomColor: '#00BCD4',
    paddingVertical: 4,
    minWidth: 60,
  },
  doneButton: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  doneButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: 8,
  },
  popularButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
  },
  popularButtonActive: {
    backgroundColor: '#FFF3E0',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#00BCD4',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  addItemText: {
    fontSize: 16,
    color: '#00BCD4',
    fontWeight: '600',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00BCD4',
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addCategoryText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});