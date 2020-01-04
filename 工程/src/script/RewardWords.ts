export default class RewardWords extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**增加属性属性标签*/
    private word: Laya.FontClip;
    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['RewardWords'] = this;
        this.self.alpha = 0;//出现的时候隐身，方便做动画
        this.self.y = Laya.stage.height / 2;
        this.self.x = 1200;
        this.word = this.self.getChildByName('word') as Laya.FontClip;
    }

    /**通过传入的参数来，设置属性图片字的格式
     * @param word 具体字样
     * */
    initProperty(word: string): void {
        this.word.value = word;

        this.RewardWordsMove();
    };

    /**飘字动画时间线*/
    RewardWordsMove(): void {
        let timeLine = new Laya.TimeLine;
        timeLine.addLabel('appear', 0).to(this.self, { x: Laya.stage.width / 2, alpha: 1 }, 300, null, 0)
            .addLabel('pause', 0).to(this.self, { x: Laya.stage.width / 2 }, 800, null, 0)
            .addLabel('vanish_01', 0).to(this.self, { x: Laya.stage.width / 2 - 100 }, 100, null, 0)
            .addLabel('vanish_02', 0).to(this.self, { x: -1200 }, 300, null, 0)
        timeLine.play('appear', false);
        timeLine.on(Laya.Event.COMPLETE, this, function () {
            this.self.removeSelf();
        });
    }

    onDisable(): void {
    }
}