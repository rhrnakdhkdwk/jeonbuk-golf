/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flag, 
  Users, 
  BookOpen, 
  Phone, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Menu, 
  X, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Plus,
  Trash2,
  Calendar,
  Award
} from 'lucide-react';

// Types
interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
}

interface ConsultationForm {
  name: string;
  age: string;
  contact: string;
  region: string;
  available_time: string;
}

export default function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '공지사항', image_url: '' });
  const [consultation, setConsultation] = useState<ConsultationForm>({
    name: '',
    age: '',
    contact: '',
    region: '',
    available_time: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost)
      });
      setNewPost({ title: '', content: '', category: '공지사항', image_url: '' });
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }
    setSubmitStatus('submitting');
    try {
      // 1. Save to local DB
      await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultation)
      });

      // 2. Send to Formspree
      await fetch('https://formspree.io/f/xojnozeg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...consultation,
          _subject: `[전북골프경기지원센터] 새로운 상담 신청: ${consultation.name}`
        })
      });
      
      // SMS Trigger logic (opens SMS app on mobile)
      const message = `[상담신청] 성함: ${consultation.name}, 나이: ${consultation.age}, 연락처: ${consultation.contact}, 지역: ${consultation.region}, 시간: ${consultation.available_time}`;
      const smsNumbers = ['01074720742', '01087970742'];
      
      // Try to open SMS app for the first number as primary
      window.location.href = `sms:${smsNumbers[0]}?body=${encodeURIComponent(message)}`;
      
      setSubmitStatus('success');
      setConsultation({ name: '', age: '', contact: '', region: '', available_time: '' });
      setAgreed(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (err) {
      console.error('Failed to submit consultation', err);
      setSubmitStatus('idle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* SEO & Meta Tags (Simulated) */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-golf-green/10">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-golf-green rounded-full flex items-center justify-center text-white">
              <Flag size={24} />
            </div>
            <h1 className="text-xl font-bold text-golf-green tracking-tight">
              전북골프경기지원센터
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#about" className="hover:text-golf-green transition-colors">센터소개</a>
            <a href="#courses" className="hover:text-golf-green transition-colors">교육과정</a>
            <a href="#posts" className="hover:text-golf-green transition-colors">커뮤니티</a>
            <a href="#consult" className="px-5 py-2.5 bg-golf-green text-white rounded-full hover:bg-golf-green/90 transition-all shadow-lg shadow-golf-green/20">
              상담신청
            </a>
          </nav>

          <button className="md:hidden text-golf-green" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-lg font-medium">
              <a href="#about" onClick={() => setIsMenuOpen(false)}>센터소개</a>
              <a href="#courses" onClick={() => setIsMenuOpen(false)}>교육과정</a>
              <a href="#posts" onClick={() => setIsMenuOpen(false)}>커뮤니티</a>
              <a href="#consult" onClick={() => setIsMenuOpen(false)} className="text-golf-green">상담신청</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=1920" 
              alt="Golf Course" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 golf-gradient" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1.5 rounded-full bg-golf-accent/20 text-golf-accent text-sm font-semibold mb-6 border border-golf-accent/30"
            >
              전북 최고의 캐디 양성 전문 기관
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif text-white mb-8 leading-tight"
            >
              당신의 새로운 <br />
              <span className="italic text-golf-accent">커리어</span>를 티업하세요
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 mb-10 max-w-2xl mx-auto"
            >
              체계적인 교육 시스템과 현장 중심의 실습을 통해 <br className="hidden md:block" />
              최고의 골프 경기 지원 전문가로 거듭날 수 있도록 도와드립니다.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a href="#consult" className="px-8 py-4 bg-golf-accent text-golf-green font-bold rounded-full hover:scale-105 transition-transform shadow-xl">
                무료 상담 신청하기
              </a>
              <a href="#courses" className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-full border border-white/20 hover:bg-white/20 transition-all">
                교육과정 보기
              </a>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: '취업 성공률', value: '100%', icon: Award },
                { label: '협력 골프장', value: '17곳 이상', icon: MapPin },
                { label: '교육 만족도', value: '4.9/5', icon: BookOpen },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-golf-light/50 border border-golf-green/5">
                  <div className="w-12 h-12 bg-golf-green/10 rounded-full flex items-center justify-center text-golf-green mx-auto mb-4">
                    <stat.icon size={24} />
                  </div>
                  <div className="text-3xl font-bold text-golf-green mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section id="courses" className="py-24 bg-golf-light">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl font-serif text-golf-green mb-4">전문 교육 과정</h3>
              <p className="text-slate-600">기초부터 실무까지, 완벽한 캐디가 되는 길</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'NCS기반 기초 과정', 
                  desc: '골프 규칙, 에티켓, 캐디의 기본 소양 교육', 
                  duration: '10일',
                  image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800'
                },
                { 
                  title: '실전 코스 실습', 
                  desc: '실제 골프 코스에서의 거리 측정 및 클럽 선택 보조', 
                  duration: '1~2주',
                  image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?auto=format&fit=crop&q=80&w=800'
                },
                { 
                  title: '전문가 심화 과정', 
                  desc: '경기 운영 지원 및 고급 고객 응대 스킬', 
                  duration: '10일',
                  image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800'
                },
              ].map((course, i) => (
                <div key={i} className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-golf-green/5">
                  <div className="h-48 overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 text-golf-green text-xs font-bold uppercase tracking-wider mb-3">
                      <Clock size={14} /> {course.duration}
                    </div>
                    <h4 className="text-xl font-bold mb-4 text-slate-800">{course.title}</h4>
                    <p className="text-slate-600 mb-6 text-sm leading-relaxed">{course.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Posts Section */}
        <section id="posts" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h3 className="text-3xl md:text-4xl font-serif text-golf-green mb-4">센터 소식</h3>
                <p className="text-slate-600">새로운 소식과 유용한 정보를 확인하세요</p>
              </div>
              {showAdmin && (
                <button 
                  onClick={() => setShowAdmin(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-golf-green text-white rounded-lg text-sm"
                >
                  <Plus size={16} /> 새 글 작성
                </button>
              )}
            </div>

            {showAdmin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-12 p-8 bg-golf-light rounded-3xl border border-golf-green/10"
              >
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <BookOpen size={20} /> 관리자: 새 게시글 작성
                </h4>
                <form onSubmit={handlePostSubmit} className="grid gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="제목" 
                      className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none"
                      value={newPost.title}
                      onChange={e => setNewPost({...newPost, title: e.target.value})}
                      required
                    />
                    <select 
                      className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none"
                      value={newPost.category}
                      onChange={e => setNewPost({...newPost, category: e.target.value})}
                    >
                      <option>공지사항</option>
                      <option>블로그</option>
                      <option>교육후기</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    placeholder="이미지 URL (Unsplash 등)" 
                    className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none"
                    value={newPost.image_url}
                    onChange={e => setNewPost({...newPost, image_url: e.target.value})}
                  />
                  <textarea 
                    placeholder="내용" 
                    rows={4}
                    className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none"
                    value={newPost.content}
                    onChange={e => setNewPost({...newPost, content: e.target.value})}
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowAdmin(false)} className="px-6 py-2 text-slate-500">취소</button>
                    <button type="submit" className="px-8 py-2 bg-golf-green text-white rounded-xl font-bold">저장하기</button>
                  </div>
                </form>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="group flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl transition-all">
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={post.image_url || 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800'} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-bold text-golf-green uppercase tracking-widest">
                      {post.category}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                      <Calendar size={14} /> {new Date(post.created_at).toLocaleDateString()}
                    </div>
                    <h4 className="text-lg font-bold mb-3 text-slate-800 line-clamp-2">{post.title}</h4>
                    <p className="text-slate-600 text-sm line-clamp-3 mb-6 flex-grow">{post.content}</p>
                    <div className="flex items-center justify-end mt-auto">
                      {showAdmin && (
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Consultation Section */}
        <section id="consult" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1592919016381-f0796ee2d00a?auto=format&fit=crop&q=80&w=1920" 
              alt="Consultation Background" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-golf-green/90" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="text-white">
                <h3 className="text-4xl md:text-5xl font-serif mb-8">지금 바로 <br />상담을 시작하세요</h3>
                <p className="text-white/70 text-lg mb-12 leading-relaxed">
                  교육 과정, 취업 연계, 수익 구조 등 궁금하신 모든 내용을 친절하게 안내해 드립니다. 
                  고민은 시작만 늦출 뿐입니다. 지금 도전하세요.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Phone className="text-golf-accent" />
                    </div>
                    <div>
                      <div className="text-sm text-white/50 mb-1">대표 번호</div>
                      <div className="text-xl font-bold">010-7472-0742</div>
                      <div className="text-xl font-bold">010-8797-0742</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="text-golf-accent" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-white/50 mb-1">위치</div>
                      <div className="text-base font-bold">전북특별자치도 전주시 완산구 홍산중앙로31 4층</div>
                      <div className="text-base font-bold">전북특별자치도 군산시 나운2길 28 3층 알파골프아카데미</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-8 md:p-12 rounded-[2rem]">
                <h4 className="text-2xl font-bold text-golf-green mb-8 text-center">상담 신청서</h4>
                <form onSubmit={handleConsultationSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">성함</label>
                      <input 
                        type="text" 
                        required
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none transition-all"
                        placeholder="홍길동"
                        value={consultation.name}
                        onChange={e => setConsultation({...consultation, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">나이</label>
                      <input 
                        type="text" 
                        required
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none transition-all"
                        placeholder="25세"
                        value={consultation.age}
                        onChange={e => setConsultation({...consultation, age: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">연락처</label>
                    <input 
                      type="tel" 
                      required
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none transition-all"
                      placeholder="010-0000-0000"
                      value={consultation.contact}
                      onChange={e => setConsultation({...consultation, contact: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">거주지역</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none transition-all"
                      placeholder="전주시 덕진구"
                      value={consultation.region}
                      onChange={e => setConsultation({...consultation, region: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">상담가능시간</label>
                    <input 
                      type="text" 
                      required
                      className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-golf-green outline-none transition-all"
                      placeholder="평일 오후 2시 이후"
                      value={consultation.available_time}
                      onChange={e => setConsultation({...consultation, available_time: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center gap-2 py-2">
                    <input 
                      type="checkbox" 
                      id="privacy-policy"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 text-golf-green focus:ring-golf-green"
                    />
                    <label htmlFor="privacy-policy" className="text-sm text-slate-600 cursor-pointer">
                      개인정보 수집 및 이용에 동의합니다.
                    </label>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={submitStatus !== 'idle'}
                    className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl ${
                      submitStatus === 'success' 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-golf-green text-white hover:bg-golf-green/90'
                    }`}
                  >
                    {submitStatus === 'submitting' ? '전송 중...' : submitStatus === 'success' ? '신청 완료!' : '상담 신청하기'}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-4">
                    * 상담 신청 시 대표번호로 문자 알림이 전송됩니다.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-golf-accent rounded-full flex items-center justify-center text-golf-green">
                  <Flag size={18} />
                </div>
                <h1 className="text-xl font-bold tracking-tight">전북골프경기지원센터</h1>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed mb-8">
                전북 지역 최고의 캐디 양성 전문 기관으로서, 체계적인 교육과 
                안정적인 취업 지원을 통해 교육생들의 성공적인 커리어 전환을 돕고 있습니다.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-golf-accent hover:text-golf-green transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-golf-accent hover:text-golf-green transition-all"><Facebook size={20} /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-golf-accent hover:text-golf-green transition-all"><MessageCircle size={20} /></a>
              </div>
            </div>
            
            <div>
              <h5 className="font-bold mb-6">Quick Links</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">센터소개</a></li>
                <li><a href="#courses" className="hover:text-white transition-colors">교육과정</a></li>
                <li><a href="#posts" className="hover:text-white transition-colors">공지사항</a></li>
                <li><a href="#consult" className="hover:text-white transition-colors">상담신청</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6">Contact</h5>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="font-bold text-white">대표 김지원</li>
                <li className="flex flex-col gap-1">
                  <div className="flex items-center gap-2"><Phone size={14} /> 010-7472-0742</div>
                  <div className="flex items-center gap-2 ml-5">010-8797-0742</div>
                </li>
                <li className="flex flex-col gap-2">
                  <div className="flex items-start gap-2"><MapPin size={14} className="mt-1" /> 전북특별자치도 전주시 완산구 홍산중앙로31 4층</div>
                  <div className="flex items-start gap-2 ml-5">전북특별자치도 군산시 나운2길 28 3층 알파골프아카데미</div>
                </li>
                <li className="flex items-center gap-2"><Clock size={14} /> 평일 09:00 - 18:00</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <p>© 2024 전북골프경기지원센터. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">이용약관</a>
              <a href="#" className="hover:text-white font-bold">개인정보처리방침</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
