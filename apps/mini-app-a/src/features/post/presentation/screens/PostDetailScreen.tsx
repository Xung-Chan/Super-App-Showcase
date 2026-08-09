import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@navigation/navigation-types';
import { MiniAppHeader } from '@superapp/shared-ui';
import { CommentEntity } from '@post/domain/entities/CommentEntity';
import { usePostDetailVM } from '../viewmodels/usePostDetailVM';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type PostDetailRoute = RouteProp<RootStackParamList, 'PostDetailScreen'>;

export const PostDetailScreen = () => {
  const route = useRoute<PostDetailRoute>();
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const { listComment, loading, error, post, handleCreateComment } = usePostDetailVM(Number(id));
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentEntity | null>(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleReplyComment = useCallback((comment: CommentEntity) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleFocusCommentInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendComment = useCallback(() => {
    if (commentText.trim()) {
      const textToSend = replyingTo
        ? `@${replyingTo.name} ${commentText.trim()}`
        : commentText.trim();
      handleCreateComment(textToSend);
      setCommentText('');
      setReplyingTo(null);
      Keyboard.dismiss();
    }
  }, [commentText, replyingTo, handleCreateComment]);

  const renderComment = useCallback(
    ({ item }: ListRenderItemInfo<CommentEntity>) => (
      <CommentCard
        comment={item}
        onReply={handleReplyComment}
        onPress={handleReplyComment}
      />
    ),
    [handleReplyComment],
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
      <View style={styles.articleCard}>
        <Text style={styles.articleBody}>{post.body}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <MiniAppHeader title="Chi tiết bài viết" backgroundColor={COLORS.primary} />

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: 16, minHeight: 0, paddingBottom: 64 }]}>
        {/* Meta row */}
        <View style={styles.headerMeta}>
          <Icon name="calendar-outline" size={14} color={COLORS.metaText} />
          <Text style={styles.metaText}>24 Th10, 2023</Text>
          <Text style={styles.metaDot}>•</Text>
          <Icon name="eye-outline" size={14} color={COLORS.metaText} />
          <Text style={styles.metaText}>1.2k Lượt xem</Text>
        </View>
      </View>

      {/* Fixed Title Card */}
      {!loading && !error && post && (
        <View style={[styles.titleCard, { marginHorizontal: 16, marginTop: -32, zIndex: 10 }]}>
          <Text style={styles.titleCardText} numberOfLines={2}>
            {post.title}
          </Text>
        </View>
      )}

      {/* ── Scrollable content ───────────────────────────────────────────── */}
      <FlatList
        data={listComment}
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
                <Pressable
                  style={styles.commentsHeading}
                  onPress={handleFocusCommentInput}
                  hitSlop={8}
                >
                  <Icon name="comment-outline" size={18} color={COLORS.text} />
                  <Text style={styles.commentsTitle}>
                    Bình luận ({listComment.length})
                  </Text>
                </Pressable>
              </View>
            )}
          </>
        }
        ItemSeparatorComponent={CommentSeparator}
      />

      {/* ── Sticky Bottom Comment Input ──────────────────────────────────── */}
      <View
        style={[
          styles.bottomBarContainer,
          {
            paddingBottom: isKeyboardVisible
              ? 12
              : Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Replying banner indicator */}
        {replyingTo && (
          <View style={styles.replyBanner}>
            <View style={styles.replyBannerContent}>
              <Icon name="reply" size={14} color={COLORS.primary} />
              <Text style={styles.replyBannerText} numberOfLines={1}>
                Đang trả lời <Text style={styles.replyBannerName}>{replyingTo.name}</Text>
              </Text>
            </View>
            <Pressable
              onPress={handleCancelReply}
              style={({ pressed }) => [pressed && styles.pressed]}
              hitSlop={8}
            >
              <Icon name="close-circle" size={18} color={COLORS.badgeText} />
            </Pressable>
          </View>
        )}

        <View style={styles.bottomBar}>
          {/* Current user avatar */}
          <View style={styles.myAvatar}>
            <Text style={styles.myAvatarText}>ME</Text>
          </View>

          {/* Input wrapper */}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              value={commentText}
              onChangeText={setCommentText}
              placeholder={replyingTo ? `Trả lời ${replyingTo.name}...` : 'Viết bình luận...'}
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
              <Icon name="send-outline" size={20} color={COLORS.primary} />
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// ---------------------------------------------------------------------------
// CommentCard
// ---------------------------------------------------------------------------

const getInitials = (name: string) => {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

interface CommentCardProps {
  comment: CommentEntity;
  onReply?: (comment: CommentEntity) => void;
  onPress?: (comment: CommentEntity) => void;
}

const CommentCard = React.memo(({ comment, onReply, onPress }: CommentCardProps) => {
  const [liked, setLiked] = useState(false);
  const initials = getInitials(comment.name);

  return (
    <Pressable
      style={styles.commentRow}
      onPress={() => onPress?.(comment)}
    >
      {/* Avatar (paddingTop aligns it with bubble top) */}
      <View style={styles.commentAvatarWrapper}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>{initials}</Text>
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
            onPress={() => onReply?.(comment)}
            style={({ pressed }) => [pressed && styles.pressed]}
            hitSlop={8}
          >
            <Text style={styles.commentActionText}>Phản hồi</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});

const CommentSeparator = () => <View style={styles.commentSeparator} />;

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
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
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
  bottomBarContainer: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    backgroundColor: COLORS.screen,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  replyBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  replyBannerText: {
    fontSize: 12,
    color: COLORS.body,
    flex: 1,
  },
  replyBannerName: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    justifyContent: 'center',
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingLeft: 17,
    paddingRight: 46,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 44,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '400',
  },
  sendButton: {
    position: 'absolute',
    right: 6,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


