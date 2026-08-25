"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Images,
  Video,
  Heart,
  BookOpen,
  Share2,
  Settings,
  Info,
  X,
} from "lucide-react";

import MenuItem from "./MenuItem";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SideDrawer({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Background */}

          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}

          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.35 }}
            className="fixed left-0 top-0 z-50 h-screen w-[300px] bg-white p-6 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                EventQR Live
              </h2>

              <button onClick={onClose}>
                <X size={22} />
              </button>
            </div>

            <div className="space-y-2">

              <MenuItem
                icon={<Images size={20} />}
                title="Gallery"
              />

              <MenuItem
                icon={<Video size={20} />}
                title="Videos"
              />

              <MenuItem
                icon={<Heart size={20} />}
                title="Favorites"
              />

              <MenuItem
                icon={<BookOpen size={20} />}
                title="Guest Book"
              />

              <MenuItem
                icon={<Share2 size={20} />}
                title="Share Event"
              />

              <MenuItem
                icon={<Settings size={20} />}
                title="Settings"
              />

              <MenuItem
                icon={<Info size={20} />}
                title="About"
              />

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}