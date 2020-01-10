export default class RewardWords extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**增加属性属性标签*/
    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['RewardWords'] = this;
        this.self.alpha = 0;//出现的时候隐身，方便做动画
        this.self.y = Laya.stage.height / 2;
        this.self.x = 1200;
    }

    /**通过传入的参数来，设置属性图片字的格式
     * @param word 具体字样
     * */
    initProperty(word: string): void {
        let url_01 = 'candy/提示文字/牛皮.png';
        let url_02 = 'candy/提示文字/太棒了.png';
        let url_03 = 'candy/提示文字/干得漂亮.png';
        let sprite = new Laya.Sprite;
        this.self.addChild(sprite);
        sprite.pos(0, 0);
        switch (word) {
            case '牛皮':
                sprite.loadImage(url_01);
                break;
            case '太棒了':
                sprite.loadImage(url_02);
                break;
            case '干得漂亮':
                sprite.loadImage(url_03);
                break;
            default:
                break;
        }
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