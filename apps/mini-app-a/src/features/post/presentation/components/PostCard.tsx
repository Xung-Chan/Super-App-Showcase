import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PostEntity } from '@post/domain/entities/PostEntity';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


export interface PostCardProps {
  post: PostEntity;
  onPressComments: () => void;
}

export const PostCard = React.memo(({ post, onPressComments }: PostCardProps) => {
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
        <Icon name="comment-outline" size={18} color={COLORS.text} />

        <Text style={styles.commentsText}>Comments</Text>
      </Pressable>
    </View>
  );
});

const COLORS = {
  border: '#BCCBB9',
  divider: '#E1E3E1',
  text: '#191C1B',
  body: '#3D4A3D',
  badge: '#D9E6DA',
  badgeText: '#5B675E',
  shadow: '#000000',
  white: '#FFFFFF',
} as const;

const styles = StyleSheet.create({
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
});