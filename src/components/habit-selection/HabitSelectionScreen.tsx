import { NativeTextInput as TextInput } from '../../design-system/components/NativeInput';
import { useTheme, useThemedStyles } from '../../design-system/theme';
import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import {
  Search,
  X,
  ChevronRight,
  PlusCircle,
  Droplets,
  Wind,
  Smartphone,
  Leaf,
  Zap,
  DollarSign,
  Heart,
  Shield,
  Flame,
  Sparkles,
  Gamepad2,
  ShoppingBag,
  Lock,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import {
  Text,
  typography,
  Card,
  Header,
  IconButton,
  EmptyState,
  colors,
  spacing,
  radii,
  shadows,
} from '../../design-system';
import {
  HABIT_CATALOG,
  CATEGORY_FILTERS,
  CatalogHabit,
  CategoryFilter,
} from '../../data/habitCatalog';
import { triggerHaptic } from '../../utils/haptics';

interface HabitSelectionScreenProps {
  onBack: () => void;
  onSelectHabit: (habit: Partial<CatalogHabit>) => void;
}

const CUSTOM_ICONS = [
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Leaf', icon: Leaf },
  { name: 'Shield', icon: Shield },
  { name: 'Heart', icon: Heart },
  { name: 'Zap', icon: Zap },
  { name: 'Flame', icon: Flame },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Droplets', icon: Droplets },
  { name: 'Wind', icon: Wind },
  { name: 'Lock', icon: Lock },
];

const CUSTOM_SUGGESTIONS = [
  'Late Night Snacking',
  'Coffee & Energy Drinks',
  'Online Shopping',
  'Social Media Scrolling',
  'Negative Self-Talk',
];

export const HabitSelectionScreen: React.FC<HabitSelectionScreenProps> = ({
  onBack,
  onSelectHabit,
}) => {
  const { colors } = useTheme();
  const styles = useThemedStyles(baseStyles);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [customHabitTitle, setCustomHabitTitle] = useState('');
  const [selectedCustomIcon, setSelectedCustomIcon] = useState('Sparkles');

  // Icon renderer helper
  const renderHabitIcon = (iconName: string, accentColor: string, size = 20) => {
    const iconProps = { size, color: accentColor, strokeWidth: 2 };
    switch (iconName) {
      case 'GlassWater':
      case 'Droplets':
        return <Droplets {...iconProps} />;
      case 'Wind':
        return <Wind {...iconProps} />;
      case 'Smartphone':
        return <Smartphone {...iconProps} />;
      case 'Leaf':
        return <Leaf {...iconProps} />;
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'DollarSign':
        return <DollarSign {...iconProps} />;
      case 'Heart':
        return <Heart {...iconProps} />;
      case 'Shield':
        return <Shield {...iconProps} />;
      case 'Flame':
        return <Flame {...iconProps} />;
      case 'Gamepad2':
        return <Gamepad2 {...iconProps} />;
      case 'ShoppingBag':
        return <ShoppingBag {...iconProps} />;
      case 'Lock':
        return <Lock {...iconProps} />;
      default:
        return <Sparkles {...iconProps} />;
    }
  };

  // Filtered habits: when 'custom' is active, return empty list so NO catalog items show below custom form
  const filteredHabits = useMemo(() => {
    if (selectedCategory === 'custom') {
      return [];
    }

    let list = HABIT_CATALOG;

    if (selectedCategory !== 'all') {
      list = list.filter((h) => h.category === selectedCategory);
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.categoryLabel.toLowerCase().includes(q) ||
          h.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  const handleSelect = (habit: CatalogHabit) => {
    triggerHaptic('selection');
    onSelectHabit(habit);
  };

  const handleCreateCustom = () => {
    const trimmed = customHabitTitle.trim();
    if (!trimmed) return;
    triggerHaptic('medium');
    onSelectHabit({
      id: `custom-${Date.now()}`,
      title: trimmed,
      category: 'custom',
      categoryLabel: 'Custom Habit',
      iconName: selectedCustomIcon,
      accentColor: colors.accent.primary,
      defaultCostPerDay: 0,
      defaultHoursPerDay: 0,
      suggestedPledge: 'To build healthy discipline and protect my inner peace.',
      tags: ['custom'],
    });
  };

  const renderItem = useCallback(
    ({ item }: { item: CatalogHabit }) => {
      return (
        <TouchableOpacity
          onPress={() => handleSelect(item)}
          activeOpacity={0.7}
          style={styles.habitItemCard}
          accessibilityRole="button"
          accessibilityLabel={`Select habit ${item.title}, category ${item.categoryLabel}`}
        >
          <View style={styles.habitRowLeft}>
            <View style={[styles.habitIconBox, { backgroundColor: colors.background.subtle }]}>
              {renderHabitIcon(item.iconName, item.accentColor)}
            </View>
            <View style={styles.habitTextContainer}>
              <Text variant="bodyMedium" color="primary" weight="500" numberOfLines={1}>
                {item.title}
              </Text>
              <Text variant="caption" color="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
                {item.categoryLabel}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      );
    },
    [onSelectHabit, colors, styles]
  );

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <Header
          kicker="NEW TRACKER"
          title="Choose a habit"
          leftSlot={
            <IconButton
              icon={<ArrowLeft size={18} color={colors.text.primary} />}
              onPress={onBack}
              size={38}
              variant="filled"
              accessibilityLabel="Back to previous screen"
            />
          }
        />
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search habits (e.g. Alcohol, Vaping, Sugar)..."
            placeholderTextColor={colors.text.secondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="never"
            accessibilityLabel="Search habit catalog"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
            >
              <X size={15} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Wrapping Category Chips Row - No horizontal clipping on any screen width */}
      <View style={styles.categoryWrapContainer}>
        {CATEGORY_FILTERS.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              onPress={() => {
                triggerHaptic('light');
                setSelectedCategory(cat.key);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${cat.label} category filter`}
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipActive,
              ]}
            >
              <Text
                variant="caption"
                color={isSelected ? 'accent' : 'secondary'}
                weight={isSelected ? '500' : '400'}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Focused Custom Habit View - Shown when 'custom' category is selected */}
      {selectedCategory === 'custom' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.customFocusedContent}
          keyboardShouldPersistTaps="handled"
        >
          <Card variant="default" padding="base" style={styles.customCard}>
            <View style={styles.customCardTop}>
              <PlusCircle size={20} color={colors.accent.primary} strokeWidth={2.2} />
              <Text variant="subcaption" color="accent" weight="500">
                CREATE CUSTOM HABIT
              </Text>
            </View>

            <Text variant="title3" color="primary" serif weight="400" style={{ marginTop: 4 }}>
              What habit are you changing?
            </Text>
            <Text variant="caption" color="secondary" style={{ marginTop: 2, marginBottom: 12 }}>
              Name any personal discipline or habit you wish to track.
            </Text>

            <TextInput
              style={styles.customTextInput}
              placeholder="e.g. Late Night Snacking, Doomscrolling, Energy Drinks"
              placeholderTextColor={colors.text.secondary}
              value={customHabitTitle}
              onChangeText={setCustomHabitTitle}
              onSubmitEditing={handleCreateCustom}
              autoFocus
              accessibilityLabel="Custom habit title"
            />

            {/* Icon Picker for Custom Habit */}
            <Text variant="caption" color="secondary" weight="500" style={{ marginTop: 14, marginBottom: 8 }}>
              CHOOSE AN ICON:
            </Text>
            <View style={styles.iconPickerRow}>
              {CUSTOM_ICONS.map((item) => {
                const IconComponent = item.icon;
                const isSelected = selectedCustomIcon === item.name;
                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => {
                      triggerHaptic('selection');
                      setSelectedCustomIcon(item.name);
                    }}
                    style={[
                      styles.iconChoiceBox,
                      isSelected && styles.iconChoiceBoxSelected,
                    ]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Choose ${item.name} icon`}
                    accessibilityState={{ selected: isSelected }}
                  >
                    <IconComponent
                      size={20}
                      color={isSelected ? colors.accent.primary : colors.text.secondary}
                      strokeWidth={isSelected ? 2.2 : 1.8}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Inspiration Suggestions */}
            <Text variant="caption" color="secondary" weight="500" style={{ marginTop: 14, marginBottom: 8 }}>
              OR TAP A SUGGESTION:
            </Text>
            <View style={styles.suggestionsWrap}>
              {CUSTOM_SUGGESTIONS.map((sug) => (
                <TouchableOpacity
                  key={sug}
                  onPress={() => {
                    triggerHaptic('light');
                    setCustomHabitTitle(sug);
                  }}
                  style={styles.sugChip}
                  activeOpacity={0.7}
                >
                  <Text variant="caption" color="secondary">
                    {sug}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 16 }} />

            <TouchableOpacity
              onPress={handleCreateCustom}
              disabled={!customHabitTitle.trim()}
              style={[
                styles.customContinueBtn,
                !customHabitTitle.trim() && styles.customContinueBtnDisabled,
              ]}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Continue to habit setup"
            >
              <Text variant="bodyMedium" color="inverse" weight="600">
                Continue with {customHabitTitle.trim() || 'Custom Habit'}
              </Text>
            </TouchableOpacity>
          </Card>
        </ScrollView>
      ) : (
        /* Catalog Items List (Shown for 'all' and specific categories) */
        <FlatList
          data={filteredHabits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<Search size={24} color={colors.accent.primary} />}
              title="No habits found"
              description={`No habits matched "${searchQuery}". Tap 'Custom' to create your own.`}
              actionLabel="Create Custom Habit"
              onAction={() => {
                setSelectedCategory('custom');
                if (searchQuery.trim()) {
                  setCustomHabitTitle(searchQuery.trim());
                }
              }}
            />
          }
        />
      )}
    </View>
  );
};

const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.canvas,
  },
  topHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs + 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.base,
    height: 46,
    ...shadows.subtle,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: colors.text.primary,
    ...typography.body,
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: colors.background.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryWrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    marginBottom: spacing.xs,
  },
  categoryChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.full,
    backgroundColor: colors.background.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: colors.accent.primaryLight,
    borderColor: colors.accent.primary,
  },
  customFocusedContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 110,
  },
  customCard: {
    backgroundColor: colors.background.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    padding: spacing.lg,
  },
  customCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  customTextInput: {
    backgroundColor: colors.background.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.md,
    height: 48,
    paddingHorizontal: spacing.md,
    color: colors.text.primary,
    ...typography.body,
  },
  iconPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconChoiceBox: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.background.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChoiceBoxSelected: {
    borderColor: colors.accent.primary,
    backgroundColor: colors.accent.primaryLight,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sugChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.full,
    backgroundColor: colors.background.canvas,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  customContinueBtn: {
    backgroundColor: colors.accent.primary,
    borderRadius: radii.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  customContinueBtnDisabled: {
    opacity: 0.45,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 110,
    gap: 8,
  },
  habitItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    minHeight: 64,
  },
  habitRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  habitIconBox: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  habitTextContainer: {
    flex: 1,
  },
});
