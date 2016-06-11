(ql:quickload "lispbuilder-sdl")
(ql:quickload "lispbuilder-sdl-gfx")


(defun init()
  (setq *w* 400)
  (setq *h* 300)
  (setq *g* 20)
  (setq *maxx* (1- (/ *w* *g*)))
  (setq *maxy* (1- (/ *h* *g*)))
  (setq *c-color* (sdl:color :r 40 :g 60 :b 80))
  
  (setq *cnt* 10)
  (setq *cnter* 0)
  (setq *direction* 'move-right)
  
  (setq *egg* nil)
  (setq *score* 0)
  
  (setq *can-change-direction* nil)
	
  (setq *ax* (make-array 3))
  (setq *ay* (make-array 3))
  (setf (aref *ax* 0) 8)
  (setf (aref *ax* 1) 7)
  (setf (aref *ax* 2) 6)
  (setf (aref *ay* 0) 12)
  (setf (aref *ay* 1) 12)
  (setf (aref *ay* 2) 12))

(defun run()
  (init)
  (sdl:with-init()
    (setf sdl:frame-rate 80)
    (sdl:window *w* *h* :title-caption "Hungry Snake")
    (birth-a-egg)
    (sdl:with-events()
      (:quit-event () t)
      (:key-down-event(:key key)
		      (case key
			(:sdl-key-r
			 (init))
			(:sdl-key-space
			 (setf *cnt* 1))))
      (:key-up-event(:key key)
		    (if (not (game-end?))
			(case key
			  (:sdl-key-space
			   (setf *cnt* 10))
			  (:sdl-key-left
			   (if (can-move-left)
			       (if (eq *direction* 'move-left)
				   (move-left)
				   (if *can-change-direction*
				       (progn
					 (setq *can-change-direction* nil)
					 (setq *direction* 'move-left))))))
			  (:sdl-key-right 
			   (if (can-move-right)
			       (if (eq *direction* 'move-right)
				   (move-right)
				   (if *can-change-direction*
				       (progn
					 (setq *can-change-direction* nil)
					 (setq *direction* 'move-right))))))
			  (:sdl-key-up 
			   (if (can-move-up)
			       (if (eq *direction* 'move-up)
				   (move-up)
				   (if *can-change-direction*
				       (progn 
					 (setq *can-change-direction* nil)
					 (setq *direction* 'move-up))))))
			  (:sdl-key-down 
			   (if (can-move-down)
			       (if (eq *direction* 'move-down)
				   (move-down)
				   (if *can-change-direction*
				       (progn
					 (setq *can-change-direction* nil)
					 (setq *direction* 'move-down)))))))))
      (:idle ()
	     (sdl:clear-display (sdl:color))
	     (draw-board)
	     (draw-line-surf *ax* *ay*)
	     (if (not *egg*)
		 (birth-a-egg))
	     (draw-egg *egg*)
	     (if (and (>= *cnter* *cnt*)
		      (not (game-end?)))
		 (progn
		   (setq *cnter* 0)
		   (apply (symbol-function *direction*) nil))
		 (incf *cnter*))
	     (if (game-end?)
		 (show-words (format nil "You Lose with score ~A!!!" *score*)))
	     (draw-cell (aref *ax* 0) (aref *ay* 0))
	     (sdl:update-display)))))

(defun show-words(str)
  (let ((f (sdl:initialise-font sdl:*font-10x20*)))
    (sdl:draw-string-solid-* str 100 (/ *h* 2)
			     :font f
			     :color sdl:*green*)))

;; 游戏是否结束		 
(defun game-end?()
  (or (< (aref *ax* 0) 0)
      (> (aref *ax* 0) *maxx*)
      (< (aref *ay* 0) 0)
      (> (aref *ay* 0) *maxy*)
      (crash-self?)))
;; 是否撞到自己
(defun crash-self?(&key (idx 1))
  (if (>= idx (length *ax*))
      nil
      (if (and (= (aref *ax* 0)
		  (aref *ax* idx))
	       (= (aref *ay* 0)
		  (aref *ay* idx)))
	  t
	  (crash-self? :idx (1+ idx)))))

;; 绘制背景格子
(defun draw-board()
  (let ((color (sdl:color :r 30 :g 30 :b 30)))
    (do ((row 1 (1+ row)))
	((> (* row *g*) *h*))
      (sdl:draw-line-* 0 (* row *g*) *w* (* row *g*) :color color))
    (do ((col 1 (1+ col)))
	((> (* col *g*) *w*))
      (sdl:draw-line-* (* col *g*) 0 (* col *g*) *h* :color color))))

(defun draw-cell (x y)
  (sdl:draw-box-* (* x *g*)(* y *g*) *g* *g*) :color (sdl:color :r 200 :g 0 :b 0))

(defun draw-border (x y)
  (sdl:draw-rectangle-* (* x *g*)(* y *g*) *g* *g*) :color (sdl:color :r 20 :g 200 :b 0))

;; 绘制实心格子 start with 0
(defun draw-surf (x y)
  (sdl:fill-surface-* 120 40 75
		      :template (sdl:rectangle :x (* x *g*)
					       :y (* y *g*)
					       :w *g*
					       :h *g*)))
;; 绘制一个格子数组
(defun draw-line-surf (arr-x arr-y)
  (do ((idx 0 (1+ idx)))
      ((>= idx (length arr-x)))
    (draw-surf (aref arr-x idx)
	       (aref arr-y idx))))

;; 随机产生一个蛋
(defun birth-a-egg()
  (let ((x (random (1+ *maxx*)))
	(y (random (1+ *maxy*))))
    (if (point-in-use? x y)
	(birth-a-egg)
	(progn
	  (incf *score*)
	  ;;(sdl:window *w* *h* 
		 ;;  :title-caption (format nil "Hungry Snake: score ~A" *score*))
	  (setq *egg* (list x y))))))
	     
(defun point-in-use?(x y &key (index 0))
  (if (>= index (length *ax*))
      nil
      (if (and (= x (aref *ax* index))
	       (= y (aref *ay* index)))
	  t
	  (point-in-use? x y :index (1+ index)))))

;; 画蛋
(defun draw-egg (egg)
  (draw-surf (car egg)(cadr egg))
  (draw-border (car egg)(cadr egg)))

;; 上移
(defun move-up()
  (let* ((x (aref *ax* 0))
	 (y (1- (aref *ay* 0)))
	 (ax (concatenate 'vector (list x) *ax*))
	 (ay (concatenate 'vector (list y) *ay*)))
    (setq *can-change-direction* t)
    (if (and (= x (car *egg*))
	     (= y (cadr *egg*)))
	(progn (setf *ax* ax)
	       (setf *ay* ay)
	       (setf *egg* nil))
	(progn
	  (setf *ax* (subseq ax 0 (1- (length ax))))
	  (setf *ay* (subseq ay 0 (1- (length ay))))))))

;; 右移
(defun move-right()
  (let* ((x (1+ (aref *ax* 0)))
	 (y (aref *ay* 0))
	 (ax (concatenate 'vector (list x) *ax*))
	 (ay (concatenate 'vector (list y) *ay*)))
    (setq *can-change-direction* t)
    (if (and (= x (car *egg*))
	     (= y (cadr *egg*)))
	(progn (setf *ax* ax)
	       (setf *ay* ay)
	       (setf *egg* nil))
	(progn
	  (setf *ax* (subseq ax 0 (1- (length ax))))
	  (setf *ay* (subseq ay 0 (1- (length ay))))))))

;; 下移
(defun move-down()
  (let* ((x (aref *ax* 0))
	 (y (1+ (aref *ay* 0)))
	 (ax (concatenate 'vector (list x) *ax*))
	 (ay (concatenate 'vector (list y) *ay*)))
    (setq *can-change-direction* t)
    (if (and (= x (car *egg*))
	     (= y (cadr *egg*)))
	(progn (setf *ax* ax)
	       (setf *ay* ay)
	       (setf *egg* nil))
	(progn
	  (setf *ax* (subseq ax 0 (1- (length ax))))
	  (setf *ay* (subseq ay 0 (1- (length ay))))))))

;; 左移
(defun move-left()
  (let* ((x (1- (aref *ax* 0)))
	 (y (aref *ay* 0))
	 (ax (concatenate 'vector (list x) *ax*))
	 (ay (concatenate 'vector (list y) *ay*)))
    (setq *can-change-direction* t)
    (if (and (= x (car *egg*))
	     (= y (cadr *egg*)))
	(progn (setf *ax* ax)
	       (setf *ay* ay)
	       (setf *egg* nil))
	(progn
	  (setf *ax* (subseq ax 0 (1- (length ax))))
	  (setf *ay* (subseq ay 0 (1- (length ay))))))))


;; 是否能向左
(defun can-move-left()
  (not (eq *direction* 'move-right)))
;; 是否能向右
(defun can-move-right()
  (not (eq *direction* 'move-left)))
;; 是否能向上
(defun can-move-up()
  (not (eq *direction* 'move-down)))
;; 是否能向下
(defun can-move-down()
  (not (eq *direction* 'move-up)))
