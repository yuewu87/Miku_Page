/* MIKU NOTE · 静态数据层（全局 MIKU_DATA） */
(function () {
  "use strict";

  const POSTS = [
    {
      id: "p1",
      cat: "历史",
      title: "「39」的诞生：初音未来出道编年简史",
      date: "2026-08-31",
      img: "assets/img/idol.jpg",
      tags: ["Vocaloid", "Crypton", "39"],
      excerpt: "2007 年 8 月 31 日，一个梳着双马尾的 16 岁电子歌姬横空出世。这篇从「39」开始，聊聊她如何改变了一个时代的音乐。",
      body: [
        "<p>2007 年 8 月 31 日，Crypton Future Media 发售了以 Yamaha VOCALOID 2 引擎为基础的歌声合成软件「初音未来」。封面上那个双马尾、青色长发的虚拟歌姬，从此成了网络文化的超级符号。</p>",
        "<p>「39」在日语中可以读作 <em>mi-ku</em>，也可以读作 <em>san-kyū</em>（Thank You）。于是 3 月 9 日成了「初音日」，39 也成了整个圈子的暗号——既是名字，也是感谢。</p>",
        "<blockquote>世界で一番お姫様 そういう扱い 心得てよね ——《ワールドイズマイン》</blockquote>",
        "<p>从 ryo 的《メルト》到《世界第一的公主殿下》，再到席卷 niconico 的传说曲，初音未来把「任何人都能成为创作者」变成了现实：写歌、画画、编舞，官方只提供了声音，世界却回赠了无穷的创作。</p>",
        "<ul><li>2007 — VOCALOID 2「初音未来」发售</li><li>2009 — 初音未来首次全息演唱会（Animelo Summer Live）</li><li>2010 — 世嘉《初音未来 -Project DIVA-》发售</li><li>2014 — 「マジカルミライ」企划启动，雪初音走红札幌</li><li>2025 — AI 时代，她依然在全世界舞台上歌唱</li></ul>",
        "<p>十六年过去，她 16 岁的设定从未变过，而唱过的歌已经多到数不清。39，感谢有你的世界。</p>"
      ]
    },
    {
      id: "p2",
      cat: "活动",
      title: "雪初音 2024：札幌路面电车涂装现场直击",
      date: "2026-02-12",
      img: "assets/img/snowmiku.jpg",
      tags: ["雪ミク", "札幌", "电车"],
      excerpt: "每年冬天的札幌都会变成雪初音的应援现场。今年市电涂装依旧可爱到犯规，一起去车站蹲点拍照吧。",
      body: [
        "<p>每年 2 月，北海道札幌都会迎来「雪祭」与「SNOW MIKU」联动。今年的主题涂装电车一出场，车站就成了粉丝们的摄影会现场。</p>",
        "<p>白色的车身配上冰雪蓝的雪初音插画，车头还有小小的雪花徽记。据说首发当天，前排拍照位从清晨就开始排队了。</p>",
        "<blockquote>雪の降る街で 君と出会えた——《Snow Fairy Story》</blockquote>",
        "<p>除了电车涂装，大通公园还有雪初音雪雕、限定周边商店，以及只有冬季才有的「雪初音冰雕点灯」。如果你的旅程赶得上 2 月，札幌值得专程去一次。</p>",
        "<ul><li>运行区间：札幌市电全线（2 月上旬 ~ 3 月中旬）</li><li>看点：车身涂装、车内广播彩蛋、限定车票</li><li>周边：大通公园雪雕展、狸小路限定店</li></ul>"
      ]
    },
    {
      id: "p3",
      cat: "现场",
      title: "新加坡演唱会回顾：全息舞台的魔法时刻",
      date: "2026-01-08",
      img: "assets/img/concert.jpg",
      tags: ["演唱会", "全息", "LIVE"],
      excerpt: "当灯光暗下、前奏响起，那个青色双马尾出现在半空时，全场三万人一起喊出了她的名字。",
      body: [
        "<p>Vocaloid 演唱会的魅力在于：台上没有真人，但每个人都知道她会从那个光幕里走出来。</p>",
        "<p>半透明投影屏让初音未来在乐队与灯光之间穿梭，安可时全场合唱《メルト》的副歌，荧光棒汇成一片青色海洋。</p>",
        "<blockquote>「みなさん、今日は来てくれてありがとうございます！」</blockquote>",
        "<ul><li>开场曲目一响，全场应援色瞬间统一</li><li>经典曲连发：メルト → ワールドイズマイン → Tell Your World</li><li>安可环节，她换上了新的演出服</li></ul>",
        "<p>散场后，很多人还留在场馆外跟着手机外放继续唱。虚拟与现实的边界，在那一刻完全消失了。</p>"
      ]
    },
    {
      id: "p4",
      cat: "手办",
      title: "手办开箱：GSC 1/8 偶像初音与收藏小贴士",
      date: "2026-03-01",
      img: "assets/img/figures.jpg",
      tags: ["手办", "GSC", "开箱"],
      excerpt: "入坑手办的第一只和第一百只，永远都是初音。开箱记录 + 防尘防倒小技巧，新手必读。",
      body: [
        "<p>GSC 的 1/8 系列以面相还原度高著称。这次的「Greatest Idol Ver.」从发丝渐层到裙摆褶皱都经得起放大镜检查。</p>",
        "<p>开箱注意三点：</p>",
        "<ul><li>先检查内盒固定是否完好，断件第一时间找售后</li><li>透明件（发梢、麦克风）别用酒精擦，会泛白</li><li>摆柜远离阳光直射，PVC 会发黄</li></ul>",
        "<p>防倒小技巧：底座下垫一圈纳米双面胶，家里有猫也不怕。至于防尘，透明亚克力展示盒是手办党的最终归宿。</p>"
      ]
    },
    {
      id: "p5",
      cat: "手办",
      title: "冬日限定：雪初音黏土人 Fluffy Coat 版",
      date: "2026-02-20",
      img: "assets/img/nendosnow.jpg",
      tags: ["雪ミク", "黏土人", "限定"],
      excerpt: "毛茸茸的大衣、可替换的雪兔配件，这一只雪初音黏土人大概是冬天最治愈的桌面摆件。",
      body: [
        "<p>黏土人的魅力在于表情替换件的丰富程度。这款 Fluffy Coat 版附带了「笑脸」「认真脸」和「打喷嚏脸」三种表情，大衣可以穿脱，围巾也是独立零件。</p>",
        "<blockquote>冬天嘛，就要毛茸茸的才对。</blockquote>",
        "<ul><li>配件：雪兔、雪花特效件、茶杯</li><li>亮点：大衣的植绒质感，摸起来真的毛茸茸</li><li>限定：雪祭现场首发，通贩数量有限</li></ul>",
        "<p>摆在办公桌上，每次加班抬头看到她的笑脸，都会想起札幌的雪。</p>"
      ]
    },
    {
      id: "p6",
      cat: "文化",
      title: "初音未来 × 网络文化：从一根葱到满屏弹幕",
      date: "2026-03-09",
      img: "assets/img/hsp.jpg",
      tags: ["网络文化", "弹幕", "梗"],
      excerpt: "为什么是葱？为什么「39」等于谢谢？弹幕文化又和这位歌姬有什么关系？一篇讲透 Miku 梗学。",
      body: [
        "<p>一切的起源是《Ievan Polkka》：一段甩葱的动画配上芬兰民谣，让初音未来从此与「葱」绑定了。粉丝被称为「葱粉」，应援物是葱型荧光棒，连官方都出过葱形周边。</p>",
        "<p>「39」的双关（mi-ku / thank you）则催生了每年 3 月 9 日的庆祝：画贺图、发翻唱、刷 #39 话题。</p>",
        "<blockquote>弹幕文化的兴起，与 Vocaloid 翻唱视频在 niconico 上的爆发几乎同步。</blockquote>",
        "<ul><li>葱：来自《Ievan Polkka》甩葱舞</li><li>39：mi-ku 与 thank you 的双关</li><li>ミクダヨー：Q 版衍生物，吉祥物级存在</li><li>雪初音：粉丝应援企划转正的官方形象</li></ul>",
        "<p>所以下次看到满屏的「39」和「🥬」，别怀疑——那就是葱粉的应援暗号。顺便，本站的弹幕墙就等着你来刷一条。</p>"
      ]
    }
  ];

  const TIMELINE = [
    { year: "2007", title: "初音未来发售", text: "Crypton 以 VOCALOID 2 为引擎推出初音未来，「电子歌姬」时代开启。", tag: "诞生" },
    { year: "2009", title: "第一场全息演唱会", text: "Animelo Summer Live 上初音未来以全息投影登场，虚拟歌姬第一次「站」上真实舞台。", tag: "LIVE" },
    { year: "2010", title: "Project DIVA 发售", text: "世嘉的音乐游戏把 Miku 带进了游戏机，也让更多人第一次叫出她的名字。", tag: "游戏" },
    { year: "2014", title: "マジカルミライ 启动", text: "大型官方企划启动；札幌的「SNOW MIKU」应援活动也让雪初音成为冬日象征。", tag: "企划" },
    { year: "2017", title: "出道十周年", text: "全球范围庆祝「10th Anniversary」，纪念交响乐公演在世界各地巡回。", tag: "纪念" },
    { year: "2020", title: "线上演唱会时代", text: "疫情之下演唱会转向线上直播，反而让更多国家的粉丝第一次「进场」。", tag: "线上" },
    { year: "2024", title: "札幌电车涂装", text: "雪初音市电涂装成为冬季札幌的移动风景线（本站有现场直击报道）。", tag: "活动" },
    { year: "2025", title: "AI × Vocaloid", text: "新一代歌声合成技术与 AI 工具涌现，创作者的工具箱再次升级，未来继续。", tag: "未来" }
  ];

  const GALLERY = [
    { src: "assets/img/hsp.jpg", cap: "HATSUNE MIKU :: HSP ver.", author: "Corsica_JP", lic: "CC BY", url: "https://www.flickr.com/photos/38485350@N06/7230983006" },
    { src: "assets/img/idol.jpg", cap: "GSC 1/8 Hatsune Miku Greatest Idol Ver.", author: "SemiOtaku Studio", lic: "CC BY-NC-SA", url: "https://www.flickr.com/photos/133860513@N03/27432406084" },
    { src: "assets/img/snowmiku.jpg", cap: "Snow Miku", author: "danzE26", lic: "CC BY", url: "https://www.flickr.com/photos/89270426@N03/28235261723" },
    { src: "assets/img/nendosnow.jpg", cap: "Nendoroid Snow Miku: Fluffy Coat version", author: "animaster", lic: "CC BY", url: "https://www.flickr.com/photos/19043905@N06/6529919929" },
    { src: "assets/img/concert.jpg", cap: "Hatsune Miku Live Concert in Singapore", author: "Danny Choo", lic: "CC BY-SA", url: "https://www.flickr.com/photos/88444437@N00/6185486084" },
    { src: "assets/img/icebucket.jpg", cap: "Miku Ice Bucket Challenge", author: "pasukaru76", lic: "CC0", url: "https://www.flickr.com/photos/38451115@N04/14826009177" },
    { src: "assets/img/chibi.jpg", cap: "Chibi Miku Clone", author: "pasukaru76", lic: "CC0", url: "https://www.flickr.com/photos/38451115@N04/16712444023" },
    { src: "assets/img/mak.jpg", cap: "Ma.K Miku", author: "pasukaru76", lic: "CC0", url: "https://www.flickr.com/photos/38451115@N04/21717875434" },
    { src: "assets/img/figures.jpg", cap: "Hatsune Miku Figures", author: "animaster", lic: "CC BY", url: "https://www.flickr.com/photos/19043905@N06/5550582448" },
    { src: "assets/img/dollfie.jpg", cap: "Hatsune Miku Dollfie", author: "Danny Choo", lic: "CC BY-SA", url: "https://www.flickr.com/photos/88444437@N00/5251131720" }
  ];

  const TYPING_LINES = [
    "世界第一的公主殿下 ♪",
    "39！谢谢你，MIKU。",
    "今天的歌单，为你而播。",
    "发一条弹幕，让公屏热闹起来吧～",
    "みなさん、こんにちは！",
    "按 ↑↑↓↓←→←→BA 有惊喜哦",
    "葱葱葱，满脑子都是葱 🥬"
  ];

  const DANMAKU_SEEDS = [
    "39！", "ミク大好き", "世界第一的公主殿下！", "葱粉路过", "🥬🥬🥬",
    "メルト神曲", "SNOW MIKU 赛高", "ワールドイズマイン", "弹幕护体", "MIKU NOTE 打卡",
    "甩葱歌想起", "おかえり", "双马尾最棒了", "♪(´▽｀)", "今天也要元气满满",
    "初音日快乐", "电子歌姬永远16岁", "Tell Your World", "前方高能", "🎤🎤🎤"
  ];

  window.MIKU_DATA = { POSTS, TIMELINE, GALLERY, TYPING_LINES, DANMAKU_SEEDS };
})();
