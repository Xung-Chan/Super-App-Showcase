import React, { useCallback, useEffect, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/navigation-types';
import type { PostEntity } from '@post/domain/entities/PostEntity';
import { postUsecases } from '@post/post.container';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PostDetailNavigation = NativeStackNavigationProp<
  RootStackParamList,
  'PostDetailScreen'
>;

type PostDetailRoute = RouteProp<RootStackParamList, 'PostDetailScreen'>;

interface CommentItem {
  id: number;
  name: string;
  email: string;
  body: string;
  initials: string;
}

// ---------------------------------------------------------------------------
// Mock comments (design shows comment section; no comment API in codebase)
// ---------------------------------------------------------------------------

const MOCK_COMMENTS: CommentItem[] = [
  {
    id: 1,
    name: 'User 2',
    email: 'Jayne_Kuhic@sydney.com',
    body: 'Bài viết rất hữu ích, cảm ơn tác giả đã chia sẻ!',
    initials: 'U2',
  },
  {
    id: 2,
    name: 'User 3',
    email: 'Nikita@garfield.biz',
    body: 'Nội dung rõ ràng và dễ hiểu. Mình đã học được nhiều thứ từ bài này.',
    initials: 'U3',
  },
  {
    id: 3,
    name: 'User 4',
    email: 'Lew@alysha.tv',
    body: 'Cảm ơn bạn đã chia sẻ! Mình sẽ thử áp dụng ngay.',
    initials: 'U4',
  },
];

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export const PostDetailScreen = () => {
  const navigation = useNavigation<PostDetailNavigation>();
  const route = useRoute<PostDetailRoute>();
  const { id } = route.params;

  const [post, setPost] = useState<PostEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const loadPost = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await postUsecases.getPostDetail({ id: Number(id) });
      setPost(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Không thể tải bài viết',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSendComment = useCallback(() => {
    if (commentText.trim()) {
      setCommentText('');
    }
  }, [commentText]);

  const renderComment = useCallback(
    ({ item }: ListRenderItemInfo<CommentItem>) => (
      <CommentCard comment={item} />
    ),
    [],
  );

  const renderArticleSection = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator color={COLORS.primary} />
          <Text style={styles.stateText}>Đang tải bài viết...</Text>
        </View>
      );
    }

    if (error || !post) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {error ?? 'Không tìm thấy bài viết'}
          </Text>
        </View>
      );
    }

    return (
      <>
        {/* Title card floating below header */}
        <View style={styles.titleCard}>
          <Text style={styles.titleCardText} numberOfLines={2}>
            {post.title}
          </Text>
        </View>

        {/* Article body card */}
        <View style={styles.articleCard}>
          <Text style={styles.articleBody}>{post.body}</Text>
        </View>
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* Back + title + badge row */}
        <View style={styles.headerTop}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
          >
            <BackIcon />
          </Pressable>

          <Text style={styles.headerTitle} numberOfLines={1}>
            {post?.title ?? ''}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>USER {post?.userId ?? ''}</Text>
          </View>
        </View>

        {/* Meta row */}
        <View style={styles.headerMeta}>
          <CalendarIcon />
          <Text style={styles.metaText}>24 Th10, 2023</Text>
          <Text style={styles.metaDot}>•</Text>
          <EyeIcon />
          <Text style={styles.metaText}>1.2k Lượt xem</Text>
        </View>
      </View>

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <FlatList
        data={MOCK_COMMENTS}
        keyExtractor={item => String(item.id)}
        renderItem={renderComment}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {renderArticleSection()}
            {/* Comments section heading */}
            {!loading && !error && post && (
              <View style={styles.commentsSection}>
                <View style={styles.commentsHeading}>
                  <CommentBubbleIcon />
                  <Text style={styles.commentsTitle}>
                    Bình luận (12)
                  </Text>
                </View>
              </View>
            )}
          </>
        }
        ItemSeparatorComponent={CommentSeparator}
      />

      {/* ── Sticky Bottom Comment Input ──────────────────────────────────── */}
      <View style={styles.bottomBar}>
        {/* Current user avatar */}
        <View style={styles.myAvatar}>
          <Text style={styles.myAvatarText}>ME</Text>
        </View>

        {/* Input wrapper */}
        <View style={styles.inputWrapper}>
          <TextInput
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Viết bình luận..."
            placeholderTextColor={COLORS.body}
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={handleSendComment}
          />
          <Pressable
            onPress={handleSendComment}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
          >
            <SendIcon />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// ---------------------------------------------------------------------------
// CommentCard
// ---------------------------------------------------------------------------

const CommentCard = React.memo(({ comment }: { comment: CommentItem }) => {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.commentRow}>
      {/* Avatar (paddingTop aligns it with bubble top) */}
      <View style={styles.commentAvatarWrapper}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>{comment.initials}</Text>
        </View>
      </View>

      {/* Bubble + actions */}
      <View style={styles.commentRight}>
        {/* Bubble */}
        <View style={styles.commentBubble}>
          {/* Name + email */}
          <View style={styles.commentHeader}>
            <Text style={styles.commentName}>{comment.name}</Text>
            <Text style={styles.commentEmail} numberOfLines={1}>
              {'• '}{comment.email}
            </Text>
          </View>
          {/* Body */}
          <Text style={styles.commentBody}>{comment.body}</Text>
        </View>

        {/* Like / Reply */}
        <View style={styles.commentActions}>
          <Pressable
            onPress={() => setLiked(prev => !prev)}
            style={({ pressed }) => [pressed && styles.pressed]}
            hitSlop={8}
          >
            <Text
              style={[
                styles.commentActionText,
                liked && styles.commentActionLiked,
              ]}
            >
              Thích
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [pressed && styles.pressed]}
            hitSlop={8}
          >
            <Text style={styles.commentActionText}>Phản hồi</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
});

const CommentSeparator = () => <View style={styles.commentSeparator} />;

// ---------------------------------------------------------------------------
// Inline geometric icon components (no external asset dependencies)
// ---------------------------------------------------------------------------

const BackIcon = () => (
  <View style={iconStyles.back}>
    <View style={iconStyles.backChevron} />
    <View style={iconStyles.backLine} />
  </View>
);

const CalendarIcon = () => (
  <View style={iconStyles.calendar}>
    <View style={iconStyles.calendarBody} />
    <View style={iconStyles.calendarBar} />
  </View>
);

const EyeIcon = () => (
  <View style={iconStyles.eye}>
    <View style={iconStyles.eyeOuter} />
    <View style={iconStyles.eyeInner} />
  </View>
);

const CommentBubbleIcon = () => (
  <View style={iconStyles.commentWrap}>
    <View style={iconStyles.commentOuter} />
    <View style={iconStyles.commentTail} />
  </View>
);

const SendIcon = () => (
  <View style={iconStyles.sendWrap}>
    <View style={iconStyles.sendArrow} />
  </View>
);

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  primary: '#006E2E',
  screen: '#F8FAF8',
  white: '#FFFFFF',
  border: '#E1E3E1',
  inputBorder: '#BCCBB9',
  text: '#191C1B',
  body: '#3D4A3D',
  metaText: '#F2F4F2',
  badge: '#D9E6DA',
  badgeText: '#5B675E',
  avatarBg: '#D9E6DA',
  avatarText: '#5B675E',
  myAvatarBg: '#00B14F',
  myAvatarText: '#003A15',
  inputBg: '#F2F4F2',
  shadow: '#000000',
  liked: '#006E2E',
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 64,
    gap: 8,
    minHeight: 100,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.badge,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    flexShrink: 0,
  },
  badgeText: {
    color: COLORS.badgeText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: COLORS.metaText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  metaDot: {
    color: COLORS.metaText,
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: -4,
  },
  pressed: {
    opacity: 0.65,
  },

  // ── List ────────────────────────────────────────────────────────────────
  list: {
    flex: 1,
    marginTop: -48,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
  },

  // ── Title card (floating pill below header) ──────────────────────────────
  titleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 20,
    paddingVertical: 9,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  titleCardText: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Article card ────────────────────────────────────────────────────────
  articleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: 32,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  articleBody: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
  },

  // ── State ───────────────────────────────────────────────────────────────
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 32,
  },
  stateText: {
    color: COLORS.body,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  // ── Comments section ────────────────────────────────────────────────────
  commentsSection: {
    marginBottom: 24,
  },
  commentsHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentsTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },

  // ── Comment row ─────────────────────────────────────────────────────────
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  commentAvatarWrapper: {
    paddingTop: 12,
    flexShrink: 0,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    color: COLORS.avatarText,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  commentRight: {
    flex: 1,
    gap: 8,
    alignItems: 'flex-end',
  },
  commentBubble: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    gap: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'nowrap',
  },
  commentName: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  commentEmail: {
    color: COLORS.body,
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '400',
    flexShrink: 1,
  },
  commentBody: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    alignSelf: 'flex-start',
    paddingLeft: 4,
  },
  commentActionText: {
    color: COLORS.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  commentActionLiked: {
    color: COLORS.liked,
    fontWeight: '600',
  },
  commentSeparator: {
    height: 0,
  },

  // ── Bottom bar ──────────────────────────────────────────────────────────
  bottomBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  myAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.myAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  myAvatarText: {
    color: COLORS.myAvatarText,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingLeft: 17,
    paddingRight: 49,
    paddingVertical: 14,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  sendButton: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    width: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ---------------------------------------------------------------------------
// Icon styles (simple geometric approximations matching design)
// ---------------------------------------------------------------------------

const iconStyles = StyleSheet.create({
  // Back arrow  ←
  back: {
    width: 19,
    height: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backChevron: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.white,
    transform: [{ rotate: '45deg' }],
    left: 3,
    top: 5,
  },
  backLine: {
    position: 'absolute',
    width: 13,
    height: 2,
    backgroundColor: COLORS.white,
    left: 3,
    top: 8,
  },

  // Calendar icon 🗓
  calendar: {
    width: 12,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBody: {
    width: 12,
    height: 10,
    borderWidth: 1.5,
    borderColor: COLORS.metaText,
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  calendarBar: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: COLORS.metaText,
    position: 'absolute',
    top: 0,
  },

  // Eye icon 👁
  eye: {
    width: 15,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOuter: {
    width: 15,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: COLORS.metaText,
    position: 'absolute',
  },
  eyeInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.metaText,
  },

  // Comment bubble icon 💬
  commentWrap: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentOuter: {
    width: 20,
    height: 17,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: COLORS.text,
    position: 'absolute',
    top: 2,
  },
  commentTail: {
    width: 6,
    height: 6,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.text,
    transform: [{ rotate: '-45deg' }],
    position: 'absolute',
    bottom: 1,
    left: 5,
    backgroundColor: COLORS.screen,
  },

  // Send arrow icon ➤
  sendWrap: {
    width: 19,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendArrow: {
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.primary,
    transform: [{ rotate: '45deg' }],
  },
});