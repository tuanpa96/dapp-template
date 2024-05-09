/* eslint-disable */
// https://js.intercomcdn.com/shim.latest.js
!(function (e) {
  var t = {};
  function n(r) {
    if (t[r]) return t[r].exports;
    var o = (t[r] = { i: r, l: !1, exports: {} });
    return e[r].call(o.exports, o, o.exports, n), (o.l = !0), o.exports;
  }
  (n.m = e),
    (n.c = t),
    (n.d = function (e, t, r) {
      n.o(e, t) || Object.defineProperty(e, t, { enumerable: !0, get: r });
    }),
    (n.r = function (e) {
      "undefined" != typeof Symbol &&
        Symbol.toStringTag &&
        Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
        Object.defineProperty(e, "__esModule", { value: !0 });
    }),
    (n.t = function (e, t) {
      if ((1 & t && (e = n(e)), 8 & t)) return e;
      if (4 & t && "object" == typeof e && e && e.__esModule) return e;
      var r = Object.create(null);
      if (
        (n.r(r),
        Object.defineProperty(r, "default", { enumerable: !0, value: e }),
        2 & t && "string" != typeof e)
      )
        for (var o in e)
          n.d(
            r,
            o,
            function (t) {
              return e[t];
            }.bind(null, o)
          );
      return r;
    }),
    (n.n = function (e) {
      var t =
        e && e.__esModule
          ? function () {
              return e.default;
            }
          : function () {
              return e;
            };
      return n.d(t, "a", t), t;
    }),
    (n.o = function (e, t) {
      return Object.prototype.hasOwnProperty.call(e, t);
    }),
    (n.p = "https://js.intercomcdn.com/"),
    n((n.s = 1047));
})({
  1047: function (e, t, n) {
    e.exports = n(1068);
  },
  1068: function (e, t, n) {
    "use strict";
    n.r(t);
    var r = [
        "position: absolute !important;",
        "opacity: 0 !important;",
        "width: 1px !important;",
        "height: 1px !important;",
        "top: 0 !important;",
        "left: 0 !important;",
        "border: none !important;",
        "display: block !important;",
        "pointer-events: none !important;",
      ].join(" "),
      o = function (e) {
        var t = e.document.createElement("iframe");
        return t.setAttribute("style", r), t;
      },
      i = n(227),
      c = [],
      a = 0,
      u = function (e) {
        for (; 2 > c.length; ) c.push(s(e));
      },
      s = function (e) {
        return (function (e, t) {
          var n = o(e);
          return (
            (n.src = i.priv_sep_html_path + "/component.html"),
            (n.name = "intercom-component-" + t),
            (n.loaded = !1),
            n.addEventListener("load", function e() {
              (n.loaded = !0), n.removeEventListener("load", e);
            }),
            e.document.body.appendChild(n),
            n
          );
        })(e, a++);
      },
      d = function (e, t, n, r) {
        !(function (e, t) {
          var n = c.shift();
          n || (n = s(e));
          var r = function e() {
            n.removeEventListener("load", e), t(n);
          };
          n.loaded ? setTimeout(r, 0) : n.addEventListener("load", r), u(e);
        })(e, function (e) {
          (e.dataset.name = t), (e.style.cssText = n), r(e);
        });
      },
      l = function (e, t, n, r) {
        var o = e.document.querySelector('iframe[data-name="' + t + '"]');
        o
          ? (function (e, t, n) {
              (e.style.cssText = t),
                setTimeout(function () {
                  return n(e);
                }, 0);
            })(o, n, r)
          : d(e, t, n, r);
      },
      m = function (e) {
        var t,
          n = !1,
          r =
            (function (e) {
              return e.Intercom && e.Intercom.q;
            })(e) || [],
          o = function (e) {
            if (
              ((n = e[0]),
              -1 !== ["boot", "update", "shutdown", "show", "hide"].indexOf(n))
            ) {
              var n,
                r = {
                  type: "intercom:api-call",
                  payload: { args: Array.from(e) },
                };
              t.postMessage(r, "*");
            } else
              console.warn(
                "Intercom – API call not supported with Privilege Separation:",
                e
              );
          },
          i = function (e) {
            "intercom:ready" === e.data.type &&
              ((n = !0),
              (t = e.source),
              (function () {
                for (; r.length; ) o(r.pop());
              })());
          };
        return (
          e.addEventListener("message", i),
          (e.Intercom = function () {
            for (var e = arguments.length, t = new Array(e), i = 0; i < e; i++)
              t[i] = arguments[i];
            n ? o(t) : r.push(t);
          }),
          function () {
            e.removeEventListener("message", i), delete e.Intercom, (n = !1);
          }
        );
      };
    function f(e, t) {
      var n = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t &&
          (r = r.filter(function (t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable;
          })),
          n.push.apply(n, r);
      }
      return n;
    }
    function p(e) {
      for (var t = 1; t < arguments.length; t++) {
        var n = null != arguments[t] ? arguments[t] : {};
        t % 2
          ? f(Object(n), !0).forEach(function (t) {
              w(e, t, n[t]);
            })
          : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
          : f(Object(n)).forEach(function (t) {
              Object.defineProperty(
                e,
                t,
                Object.getOwnPropertyDescriptor(n, t)
              );
            });
      }
      return e;
    }
    function w(e, t, n) {
      return (
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n),
        e
      );
    }
    var v = function (e) {
        var t, n;
        return {
          location: null == e ? void 0 : e.location,
          referrer:
            null == e || null === (t = e.document) || void 0 === t
              ? void 0
              : t.referrer,
          title:
            null == e || null === (n = e.document) || void 0 === n
              ? void 0
              : n.title,
        };
      },
      h = function (e) {
        return { innerHeight: e.innerHeight, innerWidth: e.innerWidth };
      },
      b = function (e) {
        var t = {};
        return (
          Object.keys(e).forEach(function (n) {
            n.indexOf("intercom") > -1 && (t[n] = e[n]);
          }),
          t
        );
      };
    var g = function (e, t, n) {
        !(function (e) {
          if (null == e) throw new TypeError("Cannot destructure undefined");
        })(t),
          window.requestAnimationFrame(function (t) {
            e.postMessage(
              { type: "intercom:callback", payload: t, callbackId: n },
              "*"
            );
          });
      },
      y = function e(t, n) {
        var r = t.parentElement;
        r &&
          (r.addEventListener("scroll", n),
          r === window.document.body
            ? window.addEventListener("scroll", n)
            : e(r, n));
      },
      O = function e(t, n) {
        var r = t.parentElement;
        r &&
          (r.removeEventListener("scroll", n),
          r === window.document.body
            ? window.removeEventListener("scroll", n)
            : e(r, n));
      },
      S = function (e) {
        return {
          rect:
            ((t = e.getBoundingClientRect()),
            {
              x: t.x,
              y: t.y,
              height: t.height,
              width: t.width,
              right: t.right,
              top: t.top + window.pageYOffset,
              left: t.left + window.pageXOffset,
            }),
          clippingRect: {
            x: 0,
            y: 0,
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight,
          },
        };
        var t;
      },
      j = function (e, t) {
        var n = e.selector,
          r = function () {
            var e = document.querySelector(n);
            e && t({ element: S(e) });
          };
        window.addEventListener("resize", r);
        var o = document.querySelector(n);
        return (
          o && y(o, r),
          r(),
          function () {
            var e = document.querySelector(n);
            window.removeEventListener("resize", r), O(e, r);
          }
        );
      },
      E = {},
      I = function (e) {
        try {
          var t = null,
            n = window.document.querySelector(e);
          return (
            n &&
              (t = {
                offsetWidth: n.offsetWidth,
                offsetHeight: n.offsetHeight,
                clientRects: { length: n.getClientRects().length },
              }),
            t
          );
        } catch (e) {
          return null;
        }
      },
      k = (function () {
        function e(e, t, n, r) {
          var o = this;
          (this.selector = void 0),
            (this.timeoutValue = void 0),
            (this.callback = void 0),
            (this.timeout = void 0),
            (this.waitTimeout = void 0),
            (this.document = void 0),
            (this.observer = void 0),
            (this.selector = e),
            (this.timeoutValue = t),
            (this.callback = r),
            (this.observer = new MutationObserver(this._check.bind(this))),
            (this.document = window.document),
            (this.waitTimeout = window.setTimeout(function () {
              o._initObserver(), o._startTimer(), o._check();
            }, n || 0));
        }
        var t = e.prototype;
        return (
          (t._initObserver = function () {
            this.observer.observe(this.document.body, {
              attributes: !0,
              childList: !0,
              subtree: !0,
            });
          }),
          (t._nodeIsVisible = function (e) {
            if (e)
              return !!(
                e.offsetWidth ||
                e.offsetHeight ||
                e.getClientRects.length
              );
          }),
          (t._check = function () {
            var e = I(this.selector);
            this._nodeIsVisible(e) && (this.callback(!0), this.cancel());
          }),
          (t._startTimer = function () {
            var e = this;
            (this.timeoutValue || 0 === this.timeoutValue) &&
              (this.timeout = window.setTimeout(function () {
                e.callback(!1), e.cancel();
              }, this.timeoutValue));
          }),
          (t.cancel = function () {
            this.observer.disconnect(),
              this.timeout && clearTimeout(this.timeout),
              this.waitTimeout && clearTimeout(this.waitTimeout);
          }),
          e
        );
      })(),
      _ = n(5),
      x = [
        /^https:\/\/www\.intercom\.com\/legal\/terms-and-policies/,
        /demo.dev.dynatracelabs.com\/#monitors/,
      ],
      A = Object(_.c)()
        ? [].concat(x, [/intercom-privilege-separation-enabled/])
        : [].concat(x),
      P = function (e) {
        return (
          !0 === e.INTERCOM_PRIVILEGE_SEPARATION ||
          A.some(function (t) {
            return t.test(e.location.href);
          })
        );
      },
      L = ["https://js.intercomcdn.com", "https://www.intercom-reporting.com"],
      M = ["http://intercom-js.test"],
      T = ["intercom:get-dom-element"],
      C = function (e) {
        var t,
          n,
          r,
          o = e.source,
          i = e.data,
          c = e.origin,
          a = [].concat(L);
        if (
          (Object(_.c)() && (a = [].concat(M)), -1 !== a.indexOf(c)) &&
          (P(window) || -1 !== T.indexOf(i.type))
        )
          switch (i.type) {
            case "intercom:ready":
              !(function (e) {
                var t = window.intercomSettings;
                if (t) {
                  var n = window.location.href,
                    r = document.cookie;
                  e.postMessage(
                    {
                      type: "intercom:boot",
                      payload: { settings: t, url: n, cookie: r },
                    },
                    "*"
                  );
                }
              })(o, i.payload),
                window.addEventListener(
                  "resize",
                  (function (e) {
                    return function () {
                      e.postMessage(
                        {
                          type: "intercom:window-resize",
                          payload: { updates: h(window) },
                        },
                        "*"
                      );
                    };
                  })(o)
                );
              break;
            case "intercom:create-or-update-frame":
              !(function (e, t, n) {
                var r = t.name,
                  o = t.styles;
                l(window, r, o, function (t) {
                  e.postMessage(
                    {
                      type: "intercom:callback",
                      payload: { frameName: t.name },
                      callbackId: n,
                    },
                    "*"
                  );
                });
              })(o, i.payload, i.callbackId);
              break;
            case "intercom:destroy-frame":
              (t = i.payload),
                (n = t.name),
                (r = document.querySelector('iframe[data-name="' + n + '"]')) &&
                  r.remove();
              break;
            case "intercom:write-cookie":
              !(function (e, t) {
                var n = t.cookie;
                window.document.cookie = n;
              })(0, i.payload, i.callbackId);
              break;
            case "intercom:set-storage-item":
              !(function (e, t) {
                var n = t.type,
                  r = t.key,
                  o = t.value,
                  i =
                    "localStorage" === n
                      ? window.localStorage
                      : window.sessionStorage;
                try {
                  i.setItem(r, o);
                } catch (e) {}
              })(0, i.payload);
              break;
            case "intercom:remove-storage-item":
              !(function (e, t) {
                var n = t.type,
                  r = t.key,
                  o =
                    "localStorage" === n
                      ? window.localStorage
                      : window.sessionStorage;
                try {
                  o.removeItem(r);
                } catch (e) {}
              })(0, i.payload);
              break;
            case "intercom:get-storage":
              !(function (e, t, n) {
                e.postMessage(
                  {
                    type: "intercom:callback",
                    payload: {
                      localStorage: b(window.localStorage),
                      sessionStorage: b(window.sessionStorage),
                    },
                    callbackId: n,
                  },
                  "*"
                );
              })(o, i.payload, i.callbackId);
              break;
            case "intercom:request-animation-frame":
              g(o, i.payload, i.callbackId);
              break;
            case "intercom:open-url":
              !(function (e, t) {
                var n = t.url;
                if (t.openNatively) window.open(n);
                else {
                  var r = window.open();
                  if (!r) return;
                  (r.opener = null), (r.location = n);
                }
              })(0, i.payload);
              break;
            case "intercom:prepare-for-boot":
              !(function (e) {
                e.postMessage(
                  {
                    type: "intercom:ready-for-boot",
                    payload: { cookie: window.document.cookie },
                  },
                  "*"
                );
              })(o, i.payload);
              break;
            case "intercom:add-event-listener":
              !(function (e, t) {
                var n = t.event,
                  r = t.listenerId,
                  o = t.payload,
                  i = (function (e, t) {
                    return function (n) {
                      e.postMessage(
                        { type: "intercom:event", payload: n, listenerId: t },
                        "*"
                      );
                    };
                  })(e, r);
                "reference-element-change" === n &&
                  (E[r] = { removeEventListener: j(o, i), source: e });
              })(o, i);
              break;
            case "intercom:remove-event-listener":
              !(function (e, t) {
                var n = t.listenerId,
                  r = E[n];
                r && (0, r.removeEventListener)();
              })(0, i);
              break;
            case "intercom:get-dom-element":
              !(function (e, t, n) {
                var r = I(t.selector);
                e.postMessage(
                  { type: "intercom:callback", payload: r, callbackId: n },
                  "*"
                );
              })(o, i.payload, i.callbackId);
              break;
            case "intercom:delayed-node-visibility-check":
              !(function (e, t, n) {
                new k(t.selector, t.timeoutValue, t.wait, function (t) {
                  e.postMessage(
                    { type: "intercom:callback", payload: t, callbackId: n },
                    "*"
                  );
                });
              })(o, i.payload, i.callbackId);
          }
      },
      q = n(227),
      R = "intercom-messenger",
      D = function (e) {
        e.addEventListener("message", C);
      },
      V = function () {
        var e = (function (e) {
          return p(p({}, v(e)), h(e));
        })(window);
        return (
          "window=" + encodeURIComponent(JSON.stringify(e)) + "&localStorage="
        );
      },
      H = function (e) {
        if (
          !(function (e) {
            return !!e.document.querySelector('iframe[name="' + R + '"]');
          })(e)
        ) {
          m(e);
          var t = o(e);
          (t.name = R),
            (t.src = q.priv_sep_html_path + "/frame.html?" + V()),
            e.document.body.appendChild(t),
            D(e),
            u(e);
        }
      },
      N = n(13),
      F = ["turbo:visit", "turbolinks:visit", "page:before-change"],
      z = ["turbo:before-cache", "turbolinks:before-cache"],
      W = ["turbo:load", "turbolinks:load", "page:change"];
    var B = n(304),
      G = n(227).public_path,
      X = G + "frame.d3f71718.js",
      Y = G + "vendor.58bf4134.js",
      J = G + "frame-modern.3a7eb0ce.js",
      K = G + "vendor-modern.d63e66b8.js",
      U = /bot|googlebot|crawler|spider|robot|crawling|facebookexternalhit/i,
      $ = function () {
        return window.Intercom && window.Intercom.booted;
      },
      Q = function () {
        var e,
          t =
            !!(e = navigator.userAgent.match(/Chrom(?:e|ium)\/([0-9\.]+)/)) &&
            e[1];
        return (
          !!t &&
          t.split(".").map(function (e) {
            return parseInt(e);
          })
        );
      },
      Z = function () {
        var e = document.querySelector('meta[name="referrer"]'),
          t = e ? '<meta name="referrer" content="' + e.content + '">' : "",
          n = document.createElement("iframe");
        (n.id = "intercom-frame"),
          n.setAttribute(
            "style",
            "position: absolute !important; opacity: 0 !important; width: 1px !important; height: 1px !important; top: 0 !important; left: 0 !important; border: none !important; display: block !important; z-index: -1 !important; pointer-events: none;"
          ),
          Object(N.l)() &&
            n.setAttribute(
              "style",
              n.getAttribute("style") + "visibility: hidden;"
            ),
          n.setAttribute("aria-hidden", "true"),
          n.setAttribute("tabIndex", "-1"),
          n.setAttribute("title", "Intercom"),
          document.body.appendChild(n),
          Object(B.b)(
            n,
            '<!DOCTYPE html>\n    <html lang="en">\n      <head>\n        ' +
              t +
              "\n      </head>\n      <body>\n      </body>\n    </html>"
          );
        var r,
          o = !!(r = Q()) && r[0] >= 81,
          i = Object(B.a)(o ? J : X),
          c = Object(B.a)(o ? K : Y);
        return (
          n.contentDocument.head.appendChild(i),
          n.contentDocument.head.appendChild(c),
          (window.__intercomAssignLocation = function (e) {
            window.location.assign(e);
          }),
          n
        );
      },
      ee = function () {
        var e = document.getElementById("intercom-frame");
        e && e.parentNode && e.parentNode.removeChild(e),
          delete window.__intercomAssignLocation;
      },
      te = function () {
        if (!window.Intercom) {
          var e = function e() {
            for (var t = arguments.length, n = new Array(t), r = 0; r < t; r++)
              n[r] = arguments[r];
            e.q.push(n);
          };
          (e.q = []), (window.Intercom = e);
        }
      },
      ne = function () {
        $() || (te(), Z(), (window.Intercom.booted = !0));
      };
    P(window)
      ? H(window)
      : ("attachEvent" in window && !window.addEventListener) ||
        (navigator &&
          navigator.userAgent &&
          /MSIE 9\.0/.test(navigator.userAgent) &&
          window.addEventListener &&
          !window.atob) ||
        ("onpropertychange" in document &&
          window.matchMedia &&
          /MSIE 10\.0/.test(navigator.userAgent)) ||
        (navigator && navigator.userAgent && U.test(navigator.userAgent)) ||
        window.isIntercomMessengerSheet ||
        $() ||
        (ne(),
        (function (e, t, n) {
          W.forEach(function (t) {
            document.addEventListener(t, e);
          }),
            z.forEach(function (e) {
              document.addEventListener(e, t);
            }),
            F.forEach(function (e) {
              document.addEventListener(e, n);
            });
        })(ne, ee, function () {
          window.Intercom("shutdown", !1), delete window.Intercom, ee(), te();
        }),
        D(window));
  },
  11: function (e, t, n) {
    "use strict";
    n.d(t, "a", function () {
      return r;
    });
    var r = function () {
      return window.INTERCOM_PRIVILEGE_SEPARATION;
    };
  },
  13: function (e, t, n) {
    "use strict";
    n.d(t, "d", function () {
      return a;
    }),
      n.d(t, "c", function () {
        return u;
      }),
      n.d(t, "k", function () {
        return s;
      }),
      n.d(t, "l", function () {
        return d;
      }),
      n.d(t, "f", function () {
        return l;
      }),
      n.d(t, "b", function () {
        return m;
      }),
      n.d(t, "g", function () {
        return f;
      }),
      n.d(t, "h", function () {
        return p;
      }),
      n.d(t, "i", function () {
        return w;
      }),
      n.d(t, "n", function () {
        return v;
      }),
      n.d(t, "m", function () {
        return h;
      }),
      n.d(t, "j", function () {
        return b;
      }),
      n.d(t, "e", function () {
        return g;
      });
    var r = n(11),
      o = /iphone|ipad|ipod|android|blackberry|opera mini|iemobile/i,
      i = [
        ".intercom-lightweight-app-launcher",
        ".intercom-launcher-frame",
        "#intercom-container",
        ".intercom-messenger",
        ".intercom-notifications",
      ];
    function c(e) {
      try {
        if (!(e in window)) return !1;
        var t = window[e];
        return (
          null !== t &&
          (t.setItem("intercom-test", "0"), t.removeItem("intercom-test"), !0)
        );
      } catch (e) {
        return !1;
      }
    }
    function a() {
      return c("localStorage");
    }
    function u() {
      return !!(
        window.FileReader &&
        window.File &&
        window.FileList &&
        window.FormData
      );
    }
    function s() {
      var e = m().userAgent;
      return !!e && null !== e.match(o) && void 0 !== window.parent;
    }
    function d() {
      var e = m().vendor || "",
        t = m().userAgent || "";
      return 0 === e.indexOf("Apple") && /\sSafari\//.test(t);
    }
    function l(e) {
      void 0 === e && (e = window);
      var t = m(),
        n = "Google Inc." === t.vendor && !e.chrome;
      return "" === t.languages && (t.webdriver || n);
    }
    function m() {
      return navigator || {};
    }
    function f(e) {
      return (
        void 0 === e && (e = m().userAgent),
        /iPad|iPhone|iPod/.test(e) && !window.MSStream
      );
    }
    function p() {
      var e;
      return (
        (null ===
          (e = (function () {
            if (f()) {
              var e = m().appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
              return {
                major: parseInt(e[1], 10),
                minor: parseInt(e[2], 10),
                patch: parseInt(e[3] || 0, 10),
              };
            }
            return null;
          })()) || void 0 === e
          ? void 0
          : e.major) >= 15
      );
    }
    function w() {
      var e = m().userAgent,
        t = f(e),
        n = !!e.match(/WebKit/i);
      return t && n && !e.match(/CriOS/i) && p();
    }
    function v() {
      return (
        !Object(r.a)() &&
        i.some(function (e) {
          var t = window.parent.document.querySelector(e);
          if (t) {
            var n = window.getComputedStyle(t);
            return null === n || "none" === n.display;
          }
        })
      );
    }
    var h = function () {
        return "ontouchstart" in window || navigator.maxTouchPoints > 0;
      },
      b = function () {
        return window.navigator.appVersion.indexOf("Mac") >= 0;
      },
      g = function () {
        return "ResizeObserver" in window;
      };
    t.a = {
      hasXhr2Support: function () {
        return (
          "XMLHttpRequest" in window &&
          "withCredentials" in new XMLHttpRequest()
        );
      },
      hasLocalStorageSupport: a,
      hasSessionStorageSupport: function () {
        return c("sessionStorage");
      },
      hasFileSupport: u,
      hasAudioSupport: function () {
        var e = document.createElement("audio");
        return (
          !!e.canPlayType && !!e.canPlayType("audio/mpeg;").replace(/^no$/, "")
        );
      },
      hasVisibilitySupport: function () {
        return (
          void 0 !== document.hidden ||
          void 0 !== document.mozHidden ||
          void 0 !== document.msHidden ||
          void 0 !== document.webkitHidden
        );
      },
      messengerIsVisible: function () {
        return (
          !!Object(r.a)() ||
          i.some(function (e) {
            var t = window.parent.document.querySelector(e);
            if (t) {
              var n = t.getBoundingClientRect();
              return n && n.width > 0 && n.height > 0;
            }
          })
        );
      },
      messengerHasDisplayNoneSet: v,
      isMobileBrowser: s,
      isIOSFirefox: function () {
        return !!m().userAgent.match("FxiOS");
      },
      isFirefox: function () {
        return !!m().userAgent.match("Firefox");
      },
      isSafari: d,
      isElectron: function () {
        var e = m().userAgent || "",
          t = (Object(r.a)() ? window : window.parent) || {},
          n = t.process && t.versions && t.versions.electron;
        return /\sElectron\//.test(e) || n;
      },
      isIE: function () {
        var e = m().userAgent || "";
        return e.indexOf("MSIE") > 0 || e.indexOf("Trident") > 0;
      },
      isEdge: function () {
        return (m().userAgent || "").indexOf("Edge") > 0;
      },
      isNativeMobile: function () {
        return m().isNativeMobile;
      },
      isChrome: function () {
        var e = window.chrome,
          t = m().vendor,
          n = m().userAgent.indexOf("OPR") > -1,
          r = m().userAgent.indexOf("Edge") > -1;
        return (
          !!m().userAgent.match("CriOS") ||
          (null != e && "Google Inc." === t && !1 === n && !1 === r)
        );
      },
      isIOS: f,
      isIOS15: p,
      isIOS15Safari: w,
      isAndroid: function (e) {
        return (
          void 0 === e && (e = m().userAgent),
          e && e.toLowerCase().indexOf("android") > -1
        );
      },
      isMacOS: b,
    };
  },
  227: function (e, t) {
    e.exports = {
      source_map: "hidden-source-map",
      api_base: "https://api-iam.intercom.io",
      public_path: "https://js.intercomcdn.com/",
      sheets_proxy_path: "https://intercom-sheets.com/sheets_proxy",
      sentry_proxy_path: "https://www.intercom-reporting.com/sentry/index.html",
      install_mode_base: "https://app.intercom.com",
      sentry_dsn:
        "https://f305de69cac64a84a494556d5303dc2d@app.getsentry.com/24287",
      intersection_js: "https://js.intercomcdn.com/intersection/assets/app.js",
      intersection_styles:
        "https://js.intercomcdn.com/intersection/assets/styles.js",
      article_search_messenger_app_id: 27,
      mode: "production",
      priv_sep_html_path: "https://www.intercom-reporting.com",
    };
  },
  304: function (e, t, n) {
    "use strict";
    n.d(t, "b", function () {
      return o;
    }),
      n.d(t, "a", function () {
        return i;
      });
    var r = n(13),
      o = function (e, t, n) {
        if ((void 0 === n && (n = "en"), r.a.isFirefox())) {
          var o = e.contentDocument.open();
          o.write("<!DOCTYPE html>"), o.close();
        }
        !(function (e, t, n) {
          void 0 === n && (n = "en"),
            (e.documentElement.innerHTML = t),
            e.documentElement.setAttribute("lang", n);
        })(e.contentDocument, t, n);
      },
      i = function (e) {
        var t = document.createElement("script");
        return (
          (t.type = "text/javascript"), (t.charset = "utf-8"), (t.src = e), t
        );
      };
  },
  5: function (e, t, n) {
    "use strict";
    n.d(t, "a", function () {
      return a;
    }),
      n.d(t, "b", function () {
        return m;
      }),
      n.d(t, "d", function () {
        return f;
      }),
      n.d(t, "c", function () {
        return p;
      });
    var r = n(11);
    function o(e, t) {
      var n = Object.keys(e);
      if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(e);
        t &&
          (r = r.filter(function (t) {
            return Object.getOwnPropertyDescriptor(e, t).enumerable;
          })),
          n.push.apply(n, r);
      }
      return n;
    }
    function i(e) {
      for (var t = 1; t < arguments.length; t++) {
        var n = null != arguments[t] ? arguments[t] : {};
        t % 2
          ? o(Object(n), !0).forEach(function (t) {
              c(e, t, n[t]);
            })
          : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
          : o(Object(n)).forEach(function (t) {
              Object.defineProperty(
                e,
                t,
                Object.getOwnPropertyDescriptor(n, t)
              );
            });
      }
      return e;
    }
    function c(e, t, n) {
      return (
        t in e
          ? Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (e[t] = n),
        e
      );
    }
    var a = n(227),
      u = Object.assign,
      s = void 0;
    function d() {
      var e;
      if (!Object(r.a)()) {
        var t = window.parent || window;
        if (t)
          return (
            (null == t || null === (e = t.intercomSettings) || void 0 === e
              ? void 0
              : e.api_base) ||
            (function (e) {
              var t = e.document.querySelector(
                "meta[name=intercom-js-api-base]"
              );
              return null == t ? void 0 : t.content;
            })(t)
          );
      }
    }
    function l() {
      var e = u({}, a),
        t = { api_base: d() };
      return t.api_base ? i(i({}, e), t) : e;
    }
    function m() {
      return (s = s || l());
    }
    function f(e, t) {
      m(), s && (s[e] = t);
    }
    function p() {
      return !1;
    }
  },
});
