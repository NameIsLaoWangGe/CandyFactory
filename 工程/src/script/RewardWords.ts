export default class RewardWords extends Laya.Script {
    /**自己*/
    private self: Laya.Sprite;
    /**Y轴的位置*/
    private locationY: number;
    /**增加属性属性标签*/
    constructor() { super(); }

    onEnable(): void {
        this.self = this.owner as Laya.Sprite;
        this.self['RewardWords'] = this;
        this.self.alpha = 0;//出现的时候隐身，方便做动画
        this.locationY = Laya.stage.height / 2;
        this.self.y = this.locationY;
        this.self.pivotX = this.self.width / 2;
        this.self.pivotY = this.self.height / 2;

        this.self.x = 1200;
    }

    /**通过传入的参数来，设置属性图片字的格式
     * @param word 具体字样
     * */
    initProperty(word: string): void {
        let url_01 = 'candy/提示文字/牛皮.png';
        let url_02 = 'candy/提示文字/太棒了.png';
        let url_03 = 'candy/提示文字/干得漂亮.png';
        // 避免从对象池拿出来后重复添加
        let sprite: Laya.Image;
        if (!this.self.getChildByName('word')) {
            sprite = new Laya.Image;
            this.self.addChild(sprite);
        } else {
            sprite = this.self.getChildByName('word') as Laya.Image;
        }

        sprite.name = 'word';
        sprite.anchorX = 0.5;
        sprite.anchorY = 0.5;
        sprite.pos(150, 20);
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
        // 创建底板
        let baseboard = new Laya.Image;
        baseboard.skin = 'candy/ui/文字提示底.png';
        Laya.stage.addChild(baseboard);
        baseboard.pos(Laya.stage.width / 2, this.locationY);
        baseboard.anchorX = 0.5;
        baseboard.anchorY = 0.5;
        baseboard.alpha = 0;
        baseboard.scale(0, 0);
        //注意层级
        baseboard.zOrder = 10;
        this.self.zOrder = 11;
        // 底板动画
        let timeLine_baseboard = new Laya.TimeLine;
        timeLine_baseboard.addLabel('overturn_01', 0).to(baseboard, { scaleX: 0.3, scaleY: 0.3, rotation: 90, alpha: 0.5 }, 200, null, 0)
            .addLabel('overturn_02', 0).to(baseboard, { scaleX: 1, scaleY: 1, rotation: 360, alpha: 1 }, 200, null, 0)
            .addLabel('pause', 0).to(baseboard, {}, 1600, null, 0)
            .addLabel('vanish_01', 0).to(baseboard, { scaleX: 0.2, scaleY: 0.2, rotation: -360, alpha: 0 }, 650, Laya.Ease.circInOut, 0)
        // .addLabel('vanish_02', 0).to(baseboard, { scaleX: 0.2, scaleY: 0.2, rotation: -180, alpha: 0 }, 400, null, 0)
        timeLine_baseboard.play('overturn_01', false);
        timeLine_baseboard.on(Laya.Event.COMPLETE, this, function () {
            baseboard.removeSelf();
        });

        // 字体动画
        let timeLine_self = new Laya.TimeLine;
        timeLine_self.addLabel('appear', -300).to(this.self, { rotation: 360, x: Laya.stage.width / 2, alpha: 1 }, 400, null, 0)
            .addLabel('pause', 0).to(this.self, { x: Laya.stage.width / 2 }, 1200, null, 0)
            .addLabel('vanish_02', 0).to(this.self, { rotation: -360, x: -1200 }, 650, Laya.Ease.circInOut, 0)
        timeLine_self.play('appear', false);
        timeLine_self.on(Laya.Event.COMPLETE, this, function () {
            this.self.removeSelf();
        });
    }

    onDisable(): void {
    }
}