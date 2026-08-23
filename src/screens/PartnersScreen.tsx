import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useLayoutEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { sortByOrder } from '../lib/partners';
import { useAppState } from '../state/AppStateContext';
import { colors, fontSize, radius, spacing } from '../theme';
import type { PartnersStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<PartnersStackParamList, 'PartnersList'>;

export function PartnersScreen({ navigation }: Props) {
  const { partners, removePartner, reorderPartner } = useAppState();
  const sorted = sortByOrder(partners);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add partner"
          onPress={() => navigation.navigate('PartnerForm')}
          hitSlop={8}>
          <Ionicons name="add" size={28} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation]);

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Remove partner', `Remove ${name} from your partners?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePartner(id) },
    ]);
  };

  return (
    <Screen scroll>
      <Text style={styles.intro}>
        These are the people you reach when you are triggered. The first person is called
        first.
      </Text>

      {sorted.length === 0 ? (
        <EmptyState
          title="No partners yet"
          message="Add a trusted partner by entering their details or picking from your contacts."
          action={
            <Button label="Add a partner" onPress={() => navigation.navigate('PartnerForm')} />
          }
        />
      ) : (
        <View style={styles.list}>
          {sorted.map((partner, i) => (
            <Card key={partner.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderText}>{i + 1}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{partner.name}</Text>
                  <Text style={styles.phone}>{partner.phoneNumber}</Text>
                </View>
                <View style={styles.reorder}>
                  <Pressable
                    accessibilityLabel={`Move ${partner.name} up`}
                    disabled={i === 0}
                    onPress={() => reorderPartner(partner.id, 'up')}
                    style={styles.reorderButton}>
                    <Ionicons
                      name="chevron-up"
                      size={20}
                      color={i === 0 ? colors.border : colors.textMuted}
                    />
                  </Pressable>
                  <Pressable
                    accessibilityLabel={`Move ${partner.name} down`}
                    disabled={i === sorted.length - 1}
                    onPress={() => reorderPartner(partner.id, 'down')}
                    style={styles.reorderButton}>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color={i === sorted.length - 1 ? colors.border : colors.textMuted}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={styles.actions}>
                <Button
                  label="Edit"
                  variant="secondary"
                  onPress={() => navigation.navigate('PartnerForm', { partnerId: partner.id })}
                  style={styles.action}
                />
                <Button
                  label="Remove"
                  variant="ghost"
                  onPress={() => confirmDelete(partner.id, partner.name)}
                  style={styles.action}
                />
              </View>
            </Card>
          ))}
          <Button
            label="Add another partner"
            variant="secondary"
            onPress={() => navigation.navigate('PartnerForm')}
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  phone: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  reorder: {
    justifyContent: 'center',
  },
  reorderButton: {
    padding: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  action: {
    flex: 1,
    minHeight: 44,
  },
});
