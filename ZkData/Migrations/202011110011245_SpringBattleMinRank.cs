namespace ZkData.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class SpringBattleMinRank : DbMigration
    {
        public override void Up()
        {
            RenameColumn("dbo.SpringBattles", "Rank", "MaxRank");
            AddColumn("dbo.SpringBattles", "MinRank", c => c.Int());
        }
        
        public override void Down()
        {
            RenameColumn("dbo.SpringBattles", "MaxRank", "Rank");
            DropColumn("dbo.SpringBattles", "MinRank");
        }
    }
}
