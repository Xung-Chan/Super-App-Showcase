import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation/navigation-types';
import type { PostEntity } from '@post/domain/entities/PostEntity';
import { postUsecases } from '@post/post.container';

const documentIcon = require('../../../../assets/post/document-outline.png');
const searchIcon = require('../../../../assets/post/search.png');
const commentIcon = require('../../../../assets/post/comment.png');

type PostManagementNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'PostManagementScreen'
>;

type PostCardProps = {
  post: PostEntity;
  onPressComments: () => void;
};

export const PostManagementScreen = () => {
  const navigation = useNavigation<PostManagementNavigation>();
  const [posts, setPosts] = useState<PostEntity[]>([]);
  const [searchUserId, setSearchUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const response = await postUsecases.getListPost();
      setPosts(response);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Không thể tải danh sách bài viết';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const keyword = searchUserId.trim();

    if (!keyword) {
      return posts;
    }

    return posts.filter(post => String(post.userId).includes(keyword));
  }, [posts, searchUserId]);

  const handleRefresh = useCallback(() => {
    loadPosts(true);
  }, [loadPosts]);

  const handleOpenComments = useCallback(
    (post: PostEntity) => {
      navigation.navigate('PostDetailScreen', { id: String(post.id) });
    },
    [navigation],
  );

  const renderPost = useCallback(
    ({ item }: ListRenderItemInfo<PostEntity>) => (
      <PostCard
        post={item}
        onPressComments={() => handleOpenComments(item)}
      />
    ),
    [handleOpenComments],
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

      <FlatList
        data={filteredPosts}
        keyExtractor={item => String(item.id)}
        renderItem={renderPost}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          filteredPosts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={CardSeparator}
        ListHeaderComponent={
          <View style={styles.searchContainer}>
            <Image
              source={searchIcon}
              style={styles.searchIcon}
              resizeMode="contain"
            />
            <TextInput
              value={searchUserId}
              onChangeText={setSearchUserId}
              placeholder="Tìm kiếm theo user ID"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="number-pad"
              returnKeyType="search"
              style={styles.searchInput}
            />
          </View>
        }
        ListHeaderComponentStyle={styles.searchHeader}
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
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </View>
  );
};

const PostCard = React.memo(({ post, onPressComments }: PostCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>USER {post.userId}</Text>
      </View>

      <Text style={styles.postTitle}>{post.title}</Text>

      <Text style={styles.postBody} numberOfLines={3} ellipsizeMode="tail">
        {post.body}
      </Text>

      <View style={styles.dividerWrap}>
        <View style={styles.divider} />
      </View>

      <Pressable
        onPress={onPressComments}
        style={({ pressed }) => [
          styles.commentsButton,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
      >
        <Image
          source={commentIcon}
          style={styles.commentIcon}
          resizeMode="contain"
        />
        <Text style={styles.commentsText}>Comments</Text>
      </Pressable>
    </View>
  );
});

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
  badge: '#D9E6DA',
  badgeText: '#5B675E',
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
  list: {
    flex: 1,
    marginTop: -24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  searchHeader: {
    marginBottom: 24,
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
  card: {
    width: '100%',
    padding: 21,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardSeparator: {
    height: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.badge,
  },
  badgeText: {
    color: COLORS.badgeText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
  postTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  postBody: {
    color: COLORS.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  dividerWrap: {
    paddingVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  commentsButton: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.65,
  },
  commentIcon: {
    width: 24,
    height: 24,
  },
  commentsText: {
    color: COLORS.shadow,
    fontSize: 14,
    lineHeight: 16,
    fontWeight: '600',
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
