const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const questions = [
    { text: 'カムバ期は、気に入った曲を短期間に同じ曲ばかりリピート再生する', axis: 'L' },
    { text: '同じステージのチッケム／パフォーマンス動画を、表情や振りの“差分”を見るために何度も見返す', axis: 'L' },
    { text: '「とりあえず後で」より、今ハマっている曲・コンテンツを集中的に回すほうだ', axis: 'L' },
    { text: '推し関連は、あとで見返せるように保存（ブクマ/スクショ/保存先整理）しておくことが多い', axis: 'K' },
    { text: 'プレイリスト/ライブラリ/フォルダで、曲や動画をカテゴリ分けして“自分のアーカイブ”を作るのが好きだ', axis: 'K' },
    { text: '推し活は、ひとりで情報を追って楽しむ時間がいちばん満足度が高い', axis: 'S' },
    { text: '反応や評判より、公式発表や一次ソースを自分で確認して理解したい', axis: 'S' },
    { text: 'カムバや番組出演は、TLやコミュニティと同時に盛り上がると楽しさが増える', axis: 'G' },
    { text: '同担/他担との会話や交換（情報・トレカ等）があると、推し活の熱が上がる', axis: 'G' },
    { text: '誰かと感想を言い合うことで、初めて自分の感情が整理される感覚がある', axis: 'G' },
    { text: '公式の供給（写真や動画）は、加工や編集をせず、そのままの姿を愛でるのが基本だ', axis: 'O' },
    { text: '推しの魅力を、自分なりの言葉や創作（レポ/加工/ファンアート等）で形にして残したい', axis: 'O' },
    { text: '「素敵！」と思った瞬間に満足し、特にシェアや言語化をしなくても平気だ', axis: 'E' }, // Wait, checking express/observe
    { text: '自分が感じた良さを、他の人にも知ってほしい・共感してほしいという気持ちが強い', axis: 'E' },
    { text: '自分が感じた魅力を、自分なりの言葉で発信（布教）することに喜びを感じる', axis: 'E' },
    { text: '推し活の計画は決めず、その日の気分や直感で「これが見たい」と思うものを選ぶ', axis: 'N' },
    { text: '「今これ！」という瞬間のパッションを大事にして動くほうが自分らしい', axis: 'N' },
    { text: 'スケジュールや数値を把握し、目標（スミン/ビルボード/投票等）に向けて計画的に動くのが好きだ', axis: 'T' },
    { text: '情報の取りこぼしがないように整理し、効率よく推し活を進められると安心する', axis: 'T' },
    { text: '過去から現在までの流れをしっかり把握し、積み重ねてきた歴史を理解したい', axis: 'T' }
];

const resultCopy = {
    LSON: { title: 'LSON｜瞬間没入ルーパー', feature: ['刺さった供給を“今この瞬間”に全投資して回す', '追うより先に浴びて熱を最大化', '差分視聴で沼が深まる'], aruaru: ['同じ曲/MV/チッケム無限ループ', '供給を浴び終わるまで他情報が目に入らない', '「見逃してた！」がたまに起きる'], strength: ['初速の熱量で回し・拡散のブースト', '刺さりポイント感覚が鋭い'], caution: ['抜け漏れが出やすい', '供給過多で燃え尽きやすい'], shareText: '私は LSON（瞬間没入ルーパー）！刺さったら一気に回して浴び尽くすタイプ。あなたは？ #推しタイプ診断' },
    LSOT: { title: 'LSOT｜完走ソロルーパー', feature: ['ひとりで淡々と追って確実に消化', '自分のペースが崩れにくい', '継続が得意'], aruaru: ['カムバ期も淡々と完走', '黙々と沼る', '疲れたら範囲を切れる'], strength: ['供給を取りこぼしにくい', '長期で強い'], caution: ['孤立で熱が落ちることがある', '完走志向で休めなくなる'], shareText: '私は LSOT（完走ソロルーパー）！ひとりで追って回して、着実に完走するタイプ。 #推しタイプ診断' },
    LSEN: { title: 'LSEN｜即語りルーパー', feature: ['供給→即言語化', '感想・考察が燃料', '熱量ピークで出力が止まらない'], aruaru: ['「今のここヤバい」即メモ/投稿', '回して良さの理由を言語化', '波がある'], strength: ['布教力が高い', '魅力の発見→共有が速い'], caution: ['受け取り時間が削れがち', '言語化に疲れる'], shareText: '私は LSEN（即語りルーパー）！刺さったら回して即言語化、布教までが速いタイプ。 #推しタイプ診断' },
    LSET: { title: 'LSET｜分析ループ職人', feature: ['回す＋追う＋整理', '構造化で満足', 'まとめ・解説が得意'], aruaru: ['深掘りして見返す', '情報を揃えてから出したい', '公開が遅れがち'], strength: ['情報が強い', '整理共有で周りが助かる'], caution: ['網羅欲で疲れる', '完璧主義で止まる'], shareText: '私は LSET（分析ループ職人）！回して追って整理して、推し活を研究するタイプ. #推しタイプ診断' },
    LGON: { title: 'LGON｜熱波ライドルーパー', feature: ['盛り上がりが燃料', '同時視聴で跳ねる', '熱量が連動'], aruaru: ['TL燃えると回す', '感想戦が楽しい', '熱すぎると疲れる'], strength: ['場を作る', '初動推進力'], caution: ['周囲の温度差で消耗'], shareText: '私は LGON（熱波ライドルーパー）！みんなの盛り上がりで熱が上がるタイプ。 #推しタイプ診断' },
    LGOT: { title: 'LGOT｜企画回し隊長', feature: ['追う・回す・共有を同時進行', '回す側になりやすい', '巻き込み型'], aruaru: ['投票/予定を共有', '自然と隊長', '抱え込みがち'], strength: ['推し活オペが強い', '成功体験を作れる'], caution: ['燃え尽き', '自分の時間が後回し'], shareText: '私は LGOT（企画回し隊長）！回す×追う×共有を同時に回せるタイプ。 #推しタイプ診断' },
    LGEN: { title: 'LGEN｜拡散アクセル', feature: ['反応が速い', '勢いで拡散', '場を温める'], aruaru: ['引用RT最速', '「今見て！」', '熱が落ちると無言'], strength: ['拡散の起点', '感情で魅力を伝える'], caution: ['出力過多で疲れる', '炎上・誤読リスク'], shareText: '私は LGEN（拡散アクセル）！刺さったら即リアクション＆拡散で盛り上げるタイプ. #推しタイプ診断' },
    LGET: { title: 'LGET｜広報ハブ', feature: ['情報と熱を整えて届ける', '共有の質が高い', 'ハブ役'], aruaru: ['要点まとめがち', '状況言語化', '稼働しすぎる'], strength: ['新規にも優しい交通整理', '仕組み作り'], caution: ['頼られすぎ', '運営化'], shareText: '私は LGET（広報ハブ）！情報と熱を整理して届ける、支える発信タイプ。 #推しタイプ診断' },
    KSON: { title: 'KSON｜積み置き鑑賞派', feature: ['保存して安心→後で一気見', '自分タイミング重視'], aruaru: ['「後で」が溜まる', '後追いで幸せ', '積みプレッシャー'], strength: ['追われず楽しめる', '深く味わえる'], caution: ['積みが増えると着手しにくい'], shareText: '私は KSON（積み置き鑑賞派）！まず保存して、後でまとめて浴びるタイプ。 #推しタイプ診断' },
    KSOT: { title: 'KSOT｜静かなアーカイバー', feature: ['保存・整理が得意', '後追いでも満足', '推し資産が整う'], aruaru: ['フォルダが整う', '鑑賞は後追い', '整理で満足'], strength: ['いつでも戻れる推し資産', '自分仕様最適化'], caution: ['整理目的化', '保存先分散'], shareText: '私は KSOT（静かなアーカイバー）！保存と整理で推し資産を作るタイプ。 #推しタイプ診断' },
    KSEN: { title: 'KSEN｜素材収集エディター', feature: ['刺さった断片を拾う', 'いいとこ取りが得意', '編集に繋がる'], aruaru: ['「いつか使う」素材が増える', '刺さり解像度が高い', '溜めすぎて止まる'], strength: ['伝わる素材嗅覚', '編集で布教力'], caution: ['素材で満足して詰まる'], shareText: '私は KSEN（素材収集エディター）！刺さった瞬間を拾って残す、編集気質タイプ。 #推しタイプ診断' },
    KSET: { title: 'KSET｜記録と考察の人', feature: ['保存→追跡→整理が一貫', '体系化で継続', '精度高い'], aruaru: ['後からわかる形に残す', 'ルール運用', '公開遅れがち'], strength: ['長期で強い推し活', '情報資産化'], caution: ['ルール増で負担', '完璧主義'], shareText: '私は KSET（記録と考察の人）！保存・追跡・整理で推し活を体系化するタイプ。 #推しタイプ診断' },
    KGON: { title: 'KGON｜後追いキュレーター', feature: ['評判から効率回収', '刺さるもの選別', '後追いでも満足'], aruaru: ['「それだけ見れば満足」作れる', 'リンク保存', '後追い積み'], strength: ['時間対効果が高い', '外部熱量を活用'], caution: ['後追いが溜まりすぎる'], shareText: '私は KGON（後追いキュレーター）！評判から賢く回収して楽しむタイプ。 #推しタイプ診断' },
    KGOT: { title: 'KGOT｜運営サポーター', feature: ['共有・段取りが得意', '配る側に回りやすい', '鑑賞は後で'], aruaru: ['まとめて配る', '自分は後で', '鑑賞後回し'], strength: ['周りの体験を底上げ', '信頼されやすい'], caution: ['自分の満足が置き去り'], shareText: '私は KGOT（運営サポーター）！共有と段取りで支えつつ、後で楽しむタイプ。 #推しタイプ診断' },
    KGEN: { title: 'KGEN｜スナイパー布教', feature: ['普段は静か', '刺さった時だけ鋭く出る', '一点突破'], aruaru: ['刺さった瞬間だけ連発', '一点突破布教', '温度差'], strength: ['刺さる瞬間を切り取れる', '爆発力'], caution: ['出力疲れが集中'], shareText: '私は KGEN（スナイパー布教）！刺さった時だけ鋭く布教する、波乗りタイプ。 #推しタイプ診断' },
    KGET: { title: 'KGET｜コミュ編集長', feature: ['集めて整えて届ける', '新規導線作り', '編集が得意'], aruaru: ['迷わない形に整理', '導線作りがち', '運営疲れ'], strength: ['知識を資産化', '広がる仕組み作り'], caution: ['仕事化', '境界線が必要'], shareText: '私は KGET（コミュ編集長）！集めて整えて届ける、場を育てるタイプ。 #推しタイプ診断' }
};

const axisDefinitions = {
    L: { label: 'Loop', sub: '瞬間没入', desc: '心に刺さった瞬間に全熱量を注ぎ、同じコンテンツを何度も浴びるように楽しみます。' },
    K: { label: 'Keep', sub: '積み置き', desc: 'まずは情報を保存・整理して手元に置き、自分のタイミングでじっくりと消化していくスタイルです。' },
    S: { label: 'Solo', sub: '自分中心', desc: '周囲の反応に左右されず、自分の感性とペースを大切にしながら、ひとりの時間を満喫します。' },
    G: { label: 'Group', sub: '共鳴・共有', desc: '他者との盛り上がりや情報交換が燃料。みんなで熱量を共有することで、さらに楽しくなるタイプです。' },
    O: { label: 'Observe', sub: '受容・鑑賞', desc: '公式の供給を丁寧に受け取り、余韻に浸る時間を重視。わざわざ言語化しなくても心で深く味わいます。' },
    E: { label: 'Express', sub: '出力・布教', desc: '感じた魅力をすぐに言葉や形にして発信。言語化や布教活動を通じて、推しの良さを再確認します。' },
    N: { label: 'iNtuitive', sub: '直感・気分', desc: '計画を立てるよりも「今これが見たい」という直感を優先。その瞬間の熱量に身を任せて動きます。' },
    T: { label: 'Track', sub: '把握・計画', desc: 'スケジュールや指標をしっかり把握し、計画的に推し活を運用。取りこぼしのない安心感を大切にします。' }
};

async function main() {
    console.log('Seeding data with axis mapping...');

    // 1. Questions
    await prisma.question.deleteMany();
    await prisma.question.createMany({
        data: questions.map((q, i) => ({ text: q.text, axis: q.axis, order: i }))
    });
    console.log(`- Seeded ${questions.length} questions with axis labels.`);

    // 2. Results
    await prisma.resultContent.deleteMany();
    await prisma.resultContent.createMany({
        data: Object.entries(resultCopy).map(([code, data]) => ({
            code,
            title: data.title,
            feature: data.feature,
            aruaru: data.aruaru,
            strength: data.strength,
            caution: data.caution,
            shareText: data.shareText
        }))
    });
    console.log(`- Seeded ${Object.keys(resultCopy).length} result contents.`);

    // 3. Axis
    await prisma.axisDefinition.deleteMany();
    await prisma.axisDefinition.createMany({
        data: Object.entries(axisDefinitions).map(([code, data]) => ({
            code,
            label: data.label,
            sub: data.sub,
            desc: data.desc
        }))
    });
    console.log(`- Seeded ${Object.keys(axisDefinitions).length} axis definitions.`);

    console.log('Seed complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
