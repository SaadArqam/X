'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp } from '@/lib/animations';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { Loader2, Plus } from 'lucide-react';

export const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");
  const [isPending, setIsPending] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 2. TAG PARSING LOGIC
    // Convert "#react #node prisma" -> ["react", "node", "prisma"]
    const tagsArray = tagsInput
      .split(" ")
      .map(tag => tag.replace("#", "").trim())
      .filter(Boolean);

    // 3. EXACT PAYLOAD CONSTRUCTION
    const payload = {
      title: title.trim(),
      content: content.trim(),
      status,
      tags: tagsArray,
    };

    // 4. VALIDATION
    if (!payload.title || !payload.content) {
      toast("Title and content are required", "error");
      return;
    }

    // 6. DEBUGGING
    console.log("FINAL PAYLOAD:", payload);
    
    setIsPending(true);
    try {
      // 5. API CALL
      const res = await api.post('/blogs', payload, {
        withCredentials: true
      });
      
      // 7. UI FIXES
      toast('Post created successfully!', 'success');
      
      // Clear form state
      setTitle("");
      setContent("");
      setTagsInput("");
      setStatus("published");
      
      router.push(`/blog/${res.data.data.id}`);
    } catch (err: any) {
      toast(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create post', 'error');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="max-w-3xl mx-auto py-10 px-6"
    >
      <motion.h1 variants={fadeUp} className="text-3xl font-bold text-white mb-8">Write a Post</motion.h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. CONTROLLED FORM STATE */}
        <motion.div variants={fadeUp} className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post Title..."
            className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 focus:outline-none"
            disabled={isPending}
            required
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Add tags (e.g. #react #node)"
            disabled={isPending}
            className="w-full bg-transparent border-b border-gray-700 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your story here... (Markdown supported)"
            className="w-full bg-transparent text-lg text-gray-200 placeholder-gray-600 focus:outline-none min-h-[400px] resize-y mt-6"
            disabled={isPending}
            required
          />
        </motion.div>

        <motion.div variants={fadeUp} className="flex justify-between items-center py-4 border-t border-gray-800">
          <div className="flex items-center space-x-4">
            <label className="text-gray-400 text-sm">Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "published" | "draft")}
              className="bg-gray-900 border border-gray-800 text-white rounded p-2 text-sm focus:outline-none hover:border-gray-700 transition-colors"
            >
              <option value="published">Publish</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            <span>{status === 'published' ? 'Publish Post' : 'Save Draft'}</span>
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};
