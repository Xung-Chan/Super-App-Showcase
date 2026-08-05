import React, { useCallback, useMemo, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { PostEntity } from '@post/domain/entities/PostEntity';
import { PostCard } from '../components/PostCard';
import { usePostVM } from '../viewmodels/usePostVM';

const documentIcon = require('../../../../assets/post/document-outline.png');
const searchIcon = require('../../../../assets/post/search.png');

export const PostManagementScreen = () => {
  const { listPost, loading, error, onPressPost, searchByUserId, fetchPosts } = usePostVM();
  const [searchUserId, setSearchUserId] = useState('');

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchUserId(text);
      const trimmed = text.trim();
      if (!trimmed) {
        fetchPosts();
      } else {
        const id = Number(trimmed);
        if (!isNaN(id)) {
          searchByUserId(id);
        }
      }
    },
    [fetchPosts, searchByUserId],
  );

  const handleRefresh = useCallback(() => {
    if (searchUserId.trim()) {
      const id = Number(searchUserId.trim());
      if (!isNaN(id)) {
        searchByUserId(id);
        return;
      }
    }
    fetchPosts();
  }, [fetchPosts, searchByUserId, searchUserId]);

  const renderPost = useCallback(
    ({ item }: ListRenderItemInfo<PostEntity>) => (
      <PostCard
        post={item}
        onPressComments={() => onPressPost(item.id)}
      />
    ),
    [onPressPost],
  );

  const emptyMessage = useMemo(() => {
    if (loading) {
      return 'Đang tải bài viết...';
    }

    if (error) {
      return error;
    }

    if (searchUserId.trim()) {
      return 'Không tìm thấy bài viết cho user ID này';
    }

    return 'Chưa có bài viết';
  }, [error, loading, searchUserId]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrap}>
            <Image
              source={documentIcon}
              style={styles.headerIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.headerTitle}>DANH SÁCH BÀI VIẾT</Text>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Image
            source={searchIcon}
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <TextInput
            value={searchUserId}
            onChangeText={handleSearchChange}
            placeholder="Tìm kiếm theo user ID"
            placeholderTextColor={COLORS.placeholder}
            keyboardType="number-pad"
            returnKeyType="search"
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={listPost}
        keyExtractor={item => String(item.id)}
        renderItem={renderPost}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          listPost.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={CardSeparator}
        ListEmptyComponent={
          <View style={styles.stateContainer}>
            {loading && !error ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : null}
            <Text style={styles.stateText}>{emptyMessage}</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
};

const CardSeparator = () => <View style={styles.cardSeparator} />;

const COLORS = {
  primary: '#006E2E',
  screen: '#F8FAF8',
  white: '#FFFFFF',
  border: '#BCCBB9',
  divider: '#E1E3E1',
  text: '#191C1B',
  body: '#3D4A3D',
  placeholder: '#6B7280',
  shadow: '#000000',
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },
  header: {
    height: 120,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 53,
    height: 53,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  headerIcon: {
    width: 45,
    height: 45,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginTop: -21,
    marginBottom: 16,
    zIndex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  searchContainer: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    backgroundColor: COLORS.white,
    paddingHorizontal: 9,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    width: 34,
    height: 18,
    marginRight: 1,
  },
  searchInput: {
    flex: 1,
    height: 24,
    padding: 0,
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
  },
  cardSeparator: {
    height: 16,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  stateText: {
    color: COLORS.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
