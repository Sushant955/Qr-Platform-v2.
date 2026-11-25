                          />

                          <YAxis
                            stroke="#94a3b8"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />

                          <Tooltip
                            contentStyle={{
                              background: '#0d1422',
                              border: '1px solid #1e3a50',
                              borderRadius: 12,
                              color: '#fff'
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#00D9C0"
                            strokeWidth={3}
                            fill="url(#scanGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Recent Scans */}
                  {analytics.recentScans.length > 0 && (
                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                      <h3 className="font-semibold mb-5 flex items-center gap-2">
                        <Activity size={16} className="text-cyan-400" />
                        Recent Activity
                      </h3>

                      <div className="space-y-3">
                        {analytics.recentScans.map((s, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-black/20 border border-white/5"
                          >
                            <div>
                              <p className="text-sm text-white">
                                {new Date(s.scanned_at).toLocaleString()}
                              </p>
                            </div>

                            <div className="text-xs font-mono text-slate-400">
                              {s.device_type} · {s.browser} · {s.os}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-3xl border border-purple-400/20 bg-purple-400/5 p-6">
                  <h3 className="font-semibold mb-2 text-purple-300">
                    Static QR Mode
                  </h3>
                  <p className="text-sm text-slate-400 leading-6">
                    This QR code contains its destination directly inside the
                    image. Scan analytics and destination editing through a
                    redirect are not available for static QR codes.
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6">
                <h3 className="font-semibold mb-5 flex items-center gap-2">
                  <Zap size={16} className="text-cyan-400" />
                  QR Content
                </h3>

                <div className="space-y-3">
                  {Object.entries(qr.target_data || {}).map(([k, v]) => (
                    <div
                      key={k}
                      className="flex flex-col sm:flex-row sm:gap-4 p-3 rounded-xl bg-black/20 border border-white/5"
                    >
                      <span className="text-xs uppercase tracking-wider text-slate-400 sm:w-32 shrink-0">
                        {k.replace(/_/g, ' ')}
                      </span>

                      <span className="text-sm text-white break-all">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.02] p-4 flex items-center gap-3">
                <Activity size={16} className="text-cyan-400" />
                <p className="text-xs text-slate-400">
                  Unified QR Platform · QR management interface
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-400/10 bg-white/[0.03] backdrop-blur-xl p-5 hover:border-cyan-400/30 transition">
      <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-400/5 blur-2xl rounded-full" />

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-mono text-slate-400 tracking-widest">
          {label}
        </p>
        <div className="text-cyan-400">{icon}</div>
      </div>

      <div className="text-3xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}
