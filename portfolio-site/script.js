/* ============================================================
   RITHWIK REDDY — IMMERSIVE PORTFOLIO ENGINE
   Three.js 3D · GSAP Scroll · Particles · Terminal · Tilt
   ============================================================ */

(function () {
  "use strict";

  /* ---- Utility ---- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

  /* ---- Year ---- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ==========================================================
     1.  THREE.JS — FLOATING GOLDEN GEOMETRY
     ========================================================== */
  const bgCanvas = $("#bg-canvas");

  if (bgCanvas && window.THREE) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas: bgCanvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    /* Lighting */
    const ambientLight = new THREE.AmbientLight(0xd4a853, 0.3);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xf5d799, 1.2, 100);
    pointLight1.position.set(15, 15, 15);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xe8a527, 0.6, 100);
    pointLight2.position.set(-15, -10, 10);
    scene.add(pointLight2);

    /* Geometry group */
    const shapes = [];
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a853,
      metalness: 0.7,
      roughness: 0.25,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });

    const goldSolid = new THREE.MeshStandardMaterial({
      color: 0xd4a853,
      metalness: 0.85,
      roughness: 0.18,
      transparent: true,
      opacity: 0.12,
    });

    function createShape(geometry, material, position, scale) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(position.x, position.y, position.z);
      mesh.scale.setScalar(scale);
      mesh.userData = {
        basePos: { ...position },
        rotSpeed: { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008, z: (Math.random() - 0.5) * 0.004 },
        floatSpeed: 0.3 + Math.random() * 0.5,
        floatAmp: 0.8 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2,
      };
      scene.add(mesh);
      shapes.push(mesh);
      return mesh;
    }

    /* Icosahedrons */
    createShape(new THREE.IcosahedronGeometry(1, 0), goldMaterial, { x: -12, y: 6, z: -5 }, 2.8);
    createShape(new THREE.IcosahedronGeometry(1, 1), goldSolid, { x: 14, y: -4, z: -8 }, 2.2);
    createShape(new THREE.IcosahedronGeometry(1, 0), goldMaterial, { x: -8, y: -8, z: -12 }, 1.8);

    /* Torus knots */
    createShape(new THREE.TorusKnotGeometry(1, 0.3, 80, 12, 2, 3), goldMaterial, { x: 10, y: 8, z: -10 }, 1.5);
    createShape(new THREE.TorusKnotGeometry(1, 0.25, 64, 10, 3, 2), goldSolid, { x: -14, y: -2, z: -15 }, 1.2);

    /* Octahedrons */
    createShape(new THREE.OctahedronGeometry(1, 0), goldMaterial, { x: 6, y: -10, z: -6 }, 2.0);
    createShape(new THREE.OctahedronGeometry(1, 0), goldSolid, { x: -4, y: 12, z: -18 }, 1.6);

    /* Torus */
    createShape(new THREE.TorusGeometry(1, 0.35, 16, 40), goldMaterial, { x: 16, y: 3, z: -20 }, 1.8);

    /* Additional small shapes for depth */
    createShape(new THREE.TetrahedronGeometry(1, 0), goldMaterial, { x: -18, y: 10, z: -22 }, 1.2);
    createShape(new THREE.TetrahedronGeometry(1, 0), goldSolid, { x: 20, y: -8, z: -25 }, 1.0);
    createShape(new THREE.DodecahedronGeometry(1, 0), goldMaterial, { x: 0, y: -14, z: -18 }, 1.4);

    /* Mouse parallax */
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    window.addEventListener("pointermove", (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* Animate */
    let clock = new THREE.Clock();

    function animateThree() {
      requestAnimationFrame(animateThree);
      const elapsed = clock.getElapsedTime();

      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      camera.position.x = mouseX * 2.5;
      camera.position.y = -mouseY * 2;
      camera.lookAt(0, 0, -10);

      for (const mesh of shapes) {
        const d = mesh.userData;
        mesh.rotation.x += d.rotSpeed.x;
        mesh.rotation.y += d.rotSpeed.y;
        mesh.rotation.z += d.rotSpeed.z;
        mesh.position.y = d.basePos.y + Math.sin(elapsed * d.floatSpeed + d.phase) * d.floatAmp;
        mesh.position.x = d.basePos.x + Math.cos(elapsed * d.floatSpeed * 0.7 + d.phase) * d.floatAmp * 0.4;
      }

      renderer.render(scene, camera);
    }

    animateThree();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  /* ==========================================================
     2.  PARTICLE CONSTELLATION
     ========================================================== */
  const particleCanvas = $("#particle-canvas");

  if (particleCanvas) {
    const pCtx = particleCanvas.getContext("2d");
    let pW, pH;
    const particles = [];
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 120;
    let pmx = -999;
    let pmy = -999;

    function resizeParticles() {
      pW = particleCanvas.width = window.innerWidth;
      pH = particleCanvas.height = window.innerHeight;
    }

    resizeParticles();
    window.addEventListener("resize", resizeParticles);

    window.addEventListener("pointermove", (e) => {
      pmx = e.clientX;
      pmy = e.clientY;
    });

    class Particle {
      constructor() {
        this.x = Math.random() * pW;
        this.y = Math.random() * pH;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = 1 + Math.random() * 1.5;
        this.alpha = 0.15 + Math.random() * 0.35;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = pW;
        if (this.x > pW) this.x = 0;
        if (this.y < 0) this.y = pH;
        if (this.y > pH) this.y = 0;

        /* mouse attraction */
        const dx = pmx - this.x;
        const dy = pmy - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          this.vx += dx * 0.00008;
          this.vy += dy * 0.00008;
        }

        /* speed limit */
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 1.2) {
          this.vx *= 0.98;
          this.vy *= 0.98;
        }
      }
      draw() {
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        pCtx.fillStyle = `rgba(212, 168, 83, ${this.alpha})`;
        pCtx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      requestAnimationFrame(animateParticles);
      pCtx.clearRect(0, 0, pW, pH);

      for (const p of particles) {
        p.update();
        p.draw();
      }

      /* connections */
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            pCtx.beginPath();
            pCtx.moveTo(particles[i].x, particles[i].y);
            pCtx.lineTo(particles[j].x, particles[j].y);
            pCtx.strokeStyle = `rgba(212, 168, 83, ${alpha})`;
            pCtx.lineWidth = 0.6;
            pCtx.stroke();
          }
        }
      }

      /* mouse connections */
      if (pmx > 0) {
        for (const p of particles) {
          const dx = pmx - p.x;
          const dy = pmy - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.3;
            pCtx.beginPath();
            pCtx.moveTo(p.x, p.y);
            pCtx.lineTo(pmx, pmy);
            pCtx.strokeStyle = `rgba(245, 215, 153, ${alpha})`;
            pCtx.lineWidth = 0.8;
            pCtx.stroke();
          }
        }
      }
    }

    animateParticles();
  }

  /* ==========================================================
     3.  TERMINAL TYPING EFFECT
     ========================================================== */
  const terminalCmd = $("#terminal-cmd");
  const terminalOutput = $("#terminal-output");
  const terminalCaret = $(".terminal-caret");

  const terminalSequence = [
    {
      cmd: "cat about.txt",
      output: [
        '<span class="out-highlight">Name:</span> Rithwik Reddy Donthi Reddy',
        '<span class="out-highlight">Role:</span> CS Graduate Student & Software Engineer',
        '<span class="out-highlight">Focus:</span> Full-Stack · AI/ML · Database Systems',
        '<span class="out-highlight">Status:</span> Open to SWE opportunities ✓',
      ],
    },
  ];

  let seqIdx = 0;
  let cmdCharIdx = 0;
  let isTypingCmd = true;

  function typeTerminal() {
    if (!terminalCmd || seqIdx >= terminalSequence.length) return;
    const current = terminalSequence[seqIdx];

    if (isTypingCmd) {
      if (cmdCharIdx <= current.cmd.length) {
        terminalCmd.textContent = current.cmd.slice(0, cmdCharIdx);
        cmdCharIdx++;
        setTimeout(typeTerminal, 55 + Math.random() * 40);
      } else {
        isTypingCmd = false;
        if (terminalCaret) terminalCaret.style.display = "none";
        setTimeout(typeTerminal, 300);
      }
    } else {
      /* render output lines one by one */
      terminalOutput.innerHTML = current.output
        .map((line, i) => `<p class="out-line" data-line="${i}">${line}</p>`)
        .join("");

      const lines = $$(".out-line", terminalOutput);
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add("visible"), (i + 1) * 180);
      });

      seqIdx++;
      if (seqIdx < terminalSequence.length) {
        setTimeout(() => {
          cmdCharIdx = 0;
          isTypingCmd = true;
          terminalCmd.textContent = "";
          terminalOutput.innerHTML = "";
          if (terminalCaret) terminalCaret.style.display = "";
          typeTerminal();
        }, current.output.length * 180 + 1500);
      }
    }
  }

  setTimeout(typeTerminal, 800);

  /* ==========================================================
     4.  ROLE CYCLE (TYPEWRITER)
     ========================================================== */
  const roleCycle = $("#role-cycle");
  const roles = [
    "MS Computer Science @ University of Oklahoma",
    "Full-Stack & AI/ML Builder",
    "Focused on High-Impact Software Engineering",
  ];

  let roleIdx = 0;
  let rCharIdx = 0;
  let rDeleting = false;

  function animateRole() {
    if (!roleCycle) return;
    const current = roles[roleIdx];

    if (rDeleting) {
      rCharIdx--;
    } else {
      rCharIdx++;
    }

    roleCycle.textContent = current.slice(0, rCharIdx);

    let delay = rDeleting ? 30 : 60;

    if (!rDeleting && rCharIdx === current.length) {
      delay = 2000;
      rDeleting = true;
    }

    if (rDeleting && rCharIdx === 0) {
      rDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      delay = 400;
    }

    setTimeout(animateRole, delay);
  }

  animateRole();

  /* ==========================================================
     5.  GSAP SCROLL ANIMATIONS
     ========================================================== */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* Animate all [data-anim] elements */
    $$("[data-anim]").forEach((el) => {
      const animType = el.dataset.anim;
      const delay = parseFloat(el.dataset.delay) || 0;

      const from = {};
      const to = {
        opacity: 1,
        duration: 0.9,
        delay: delay,
        ease: "power3.out",
        onComplete: () => el.classList.add("animated"),
      };

      if (animType === "fade-up") {
        from.opacity = 0;
        from.y = 50;
        to.y = 0;
      } else if (animType === "slide-right") {
        from.opacity = 0;
        from.x = -70;
        to.x = 0;
      }

      gsap.fromTo(el, from, {
        ...to,
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          once: true,
        },
      });
    });

    /* Parallax on hero */
    gsap.to(".hero-stats", {
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.5,
      },
    });

    /* Section headers line animation */
    $$(".section-line").forEach((line) => {
      gsap.from(line, {
        width: 0,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: line,
          start: "top 85%",
          once: true,
        },
      });
    });

    /* Stagger skill list items */
    $$(".skill-pillar").forEach((pillar) => {
      const items = $$(".skill-list li", pillar);
      gsap.from(items, {
        opacity: 0,
        y: 12,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: pillar,
          start: "top 80%",
          once: true,
        },
      });
    });
  }

  /* ==========================================================
     6.  ANIMATED COUNTERS
     ========================================================== */
  const counters = $$("[data-count]");

  function animateCounter(el) {
    if (el.dataset.animated === "true") return;
    el.dataset.animated = "true";

    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const val = target * eased;
      el.textContent = val.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  if (window.IntersectionObserver) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            animateCounter(counter);
            counterObserver.unobserve(counter);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ==========================================================
     7.  3D TILT CARDS
     ========================================================== */
  $$("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
      card.style.transition = "transform 0.5s ease";
      setTimeout(() => {
        card.style.transition = "";
      }, 500);
    });
  });

  /* ==========================================================
     8.  NAVIGATION
     ========================================================== */
  const navToggle = $("#nav-toggle");
  const navLinks = $("#nav-links");
  const header = $("#site-header");

  /* Mobile toggle */
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    $$("a", navLinks).forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Active link + scroll header */
  const sections = $$("main section[id]");
  const navLinkMap = new Map(
    $$("[data-nav]").map((a) => [a.getAttribute("href")?.slice(1), a])
  );

  const progressBar = $("#scroll-progress");

  function onScroll() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

    /* Progress bar */
    if (progressBar) {
      const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    }

    /* Header class */
    if (header) {
      header.classList.toggle("scrolled", scrollY > 60);
    }

    /* Active nav */
    let currentId = sections[0]?.id;
    const offset = scrollY + 200;
    for (const sec of sections) {
      if (offset >= sec.offsetTop) currentId = sec.id;
    }

    navLinkMap.forEach((link, id) => {
      link.classList.toggle("active", id === currentId);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ==========================================================
     9.  FALLBACK — if GSAP didn't load, still reveal elements
     ========================================================== */
  if (!window.gsap) {
    const fallbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.transition = "opacity 0.7s ease, transform 0.7s ease";
            entry.target.style.transitionDelay = (parseFloat(entry.target.dataset.delay) || 0) + "s";
            entry.target.classList.add("animated");
            entry.target.style.opacity = "1";
            entry.target.style.transform = "none";
            fallbackObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    $$("[data-anim]").forEach((el) => fallbackObserver.observe(el));
  }
})();
