import React from 'react';
import { InstagramReel } from '../types';
import { Instagram, Play, Eye, Heart, ExternalLink } from 'lucide-react';

interface ReelCardProps {
  reel: InstagramReel;
}

export const ReelCard: React.FC<ReelCardProps> = ({ reel }) => {
  return (
    <div className="group relative bg-[#2C3E50] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-[#E8E4D5]/20">
      {/* Thumbnail with Video Overlay */}
      <div className="relative aspect-9/14 sm:aspect-9/15 overflow-hidden bg-stone-950">
        <img
          src={reel.thumbnailUrl}
          alt={reel.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-95"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-[#2C3E50] via-[#2C3E50]/20 to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between text-white text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold uppercase tracking-wider border border-white/10 flex items-center gap-1">
            <Instagram className="w-3 h-3 text-pink-400" />
            Reels
          </span>
          <span className="px-2 py-0.5 rounded-sm bg-black/50 backdrop-blur-xs text-[10px] text-stone-300">
            {reel.duration}
          </span>
        </div>

        {/* Play Icon in Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-13 h-13 rounded-full bg-white/25 backdrop-blur-sm border border-white/50 text-white flex items-center justify-center group-hover:scale-115 group-hover:bg-[#96281B] transition-all duration-300 shadow-xl">
            <Play className="w-6 h-6 fill-current translate-x-0.5" />
          </div>
        </div>

        {/* Metrics Pill */}
        <div className="absolute bottom-20 left-3 flex items-center gap-3 text-xs text-white/90 font-medium">
          <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-xs text-[11px]">
            <Eye className="w-3.5 h-3.5 text-[#F1C40F]" />
            {reel.views}
          </span>
          <span className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-sm backdrop-blur-xs text-[11px]">
            <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
            {reel.likes}
          </span>
        </div>

        {/* Bottom Content & Link */}
        <div className="absolute bottom-0 inset-x-0 p-4 bg-linear-to-t from-[#2C3E50] via-[#2C3E50]/95 to-transparent">
          <p className="text-[10px] font-bold text-[#F1C40F] tracking-widest mb-1 uppercase">
            {reel.tag} • {reel.categoryLabel}
          </p>
          <h4 className="font-serif italic font-bold text-sm text-[#FCFAF2] line-clamp-1 group-hover:text-amber-200 transition-colors">
            {reel.title}
          </h4>
          <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
            {reel.caption}
          </p>

          {/* Action Link out to Instagram */}
          <a
            href={reel.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-full py-2 px-3 rounded-lg bg-white/15 hover:bg-[#96281B] border border-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 backdrop-blur-xs transition-colors"
          >
            <span>Watch Reel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
