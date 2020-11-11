using PlasmaShared;
using Ratings;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data.Entity;
using System.Linq;
using System.Web.Mvc;
using ZkData;

namespace ZeroKWeb.Controllers
{
    public class BattlesController: Controller
    {
        //
        // GET: /Battles/

        /// <summary>
        ///     Returns the page of the <see cref="SpringBattle" /> with the specified ID
        /// </summary>
        public ActionResult Detail(int id, bool showWinners = false) {
            var db = new ZkDataContext();
            ViewBag.ShowWinners = showWinners;
            var bat = db.SpringBattles.FirstOrDefault(x => x.SpringBattleID == id);
            if (bat == null) return Content("No such battle exists");

            if (bat.ForumThread != null)
            {
                bat.ForumThread.UpdateLastRead(Global.AccountID, false);
                db.SaveChanges();
            }

            if (Global.AccountID != 0 && !showWinners && bat.SpringBattlePlayers.Any(y => y.AccountID == Global.AccountID && !y.IsSpectator)) ViewBag.ShowWinners = true; // show winners if player played thatbattle

            return View("BattleDetail", bat);
        }

        public class BattleSearchModel
        {
            public string Title { get; set; }
            public string Map { get; set; }
            public int[] UserId { get; set; }
            public int? PlayersFrom { get; set; }
            public int? PlayersTo { get; set; }
            public DateTime? AgeFrom { get; set; }
            public DateTime? AgeTo { get; set; }
            public RankSelector MinRank { get; set; } = RankSelector.Undefined;
            public RankSelector MaxRank { get; set; } = RankSelector.Undefined;
            public bool? Mission { get; set; }
            public bool? Bots { get; set; }
            public bool? Victory { get; set; }
            public int? offset { get; set; }
            public List<BattleQuickInfo> Data;
        }

        /// <summary>
        ///     Returns the main battle replay list; params filter
        /// </summary>
        public ActionResult Index(BattleSearchModel model) {
            var db = new ZkDataContext();

            model = model ?? new BattleSearchModel();
            var q = db.SpringBattles.Include(x => x.SpringBattlePlayers);

            // battle filters
            if (!string.IsNullOrEmpty(model.Title)) q = q.Where(b => b.Title.Contains(model.Title));
            if (!string.IsNullOrEmpty(model.Map)) q = q.Where(b => b.ResourceByMapResourceID.InternalName.Contains(model.Map));
            if (model.PlayersFrom.HasValue) q = q.Where(b => b.SpringBattlePlayers.Count(p => !p.IsSpectator) >= model.PlayersFrom);
            if (model.PlayersTo.HasValue) q = q.Where(b => b.SpringBattlePlayers.Count(p => !p.IsSpectator) <= model.PlayersTo);
            if (model.AgeFrom.HasValue) q = q.Where(b => b.StartTime >= model.AgeFrom);
            if (model.AgeTo.HasValue) q = q.Where(b => b.StartTime <= model.AgeTo);
            if (model.MinRank != RankSelector.Undefined) q = q.Where(b => b.MinRank == (int)model.MinRank);
            if (model.MaxRank != RankSelector.Undefined) q = q.Where(b => b.MaxRank == (int)model.MaxRank);
            if (model.Mission.HasValue) q = q.Where(b => b.IsMission == model.Mission);
            if (model.Bots.HasValue) q = q.Where(b => b.HasBots == model.Bots);

            //if (user == null && Global.IsAccountAuthorized) user = Global.Account.Name;
            //if (model.UserId != null) {
            //    int uniqueIds = model.UserId.Distinct().Count();
            //    switch (model.Victory)
            //    {
            //        case YesNoAny.Any:
            //            q = q.Where(b => b.SpringBattlePlayers.Where(p => model.UserId.Contains(p.AccountID) && !p.IsSpectator).Count() == uniqueIds);
            //            break;
            //        case YesNoAny.Yes:
            //            q = q.Where(b => b.SpringBattlePlayers.Where(p => model.UserId.Contains(p.AccountID) && !p.IsSpectator && p.IsInVictoryTeam).Count() == uniqueIds);
            //            break;
            //        case YesNoAny.No:
            //            q = q.Where(b => b.SpringBattlePlayers.Where(p => model.UserId.Contains(p.AccountID) && !p.IsSpectator && !p.IsInVictoryTeam).Count() == uniqueIds);
            //            break;
            //    }
            //}

            q = q.OrderByDescending(b => b.StartTime);

            if (model.offset.HasValue) q = q.Skip(model.offset.Value);
            q = q.Take(Global.AjaxScrollCount);

            var result =
                q.ToList()
                    .Select(
                        b =>
                            new BattleQuickInfo
                            {
                                Battle = b,
                                Players = b.SpringBattlePlayers,
                                Map = b.ResourceByMapResourceID,
                                Mod = b.ResourceByModResourceID
                            })
                    .ToList();


            //if(result.Count == 0)
            //    return Content("");
            model.Data = result;
            if (model.offset.HasValue) return View("BattleTileList", model);
            return View("BattleIndex", model);
        }

        /// <summary>
        ///     Returns a page with the <see cref="SpringBattle" /> infolog
        /// </summary>
        [Auth(Role = AdminLevel.Moderator)]
        public ActionResult Logs(int id) {
            using (var db = new ZkDataContext())
            {
                var bat = db.SpringBattles.Single(x => x.SpringBattleID == id);
                return Content(System.IO.File.ReadAllText(string.Format(GlobalConst.InfologPathFormat, bat.EngineGameID)), "text/plain");
                    //,string.Format("infolog_{0}.txt", bat.SpringBattleID)
            }
        }


        [HttpPost]
        [ValidateAntiForgeryToken]
        [Auth(Role = AdminLevel.Moderator)]
        public ActionResult SetApplicableRatings(int BattleID, bool MatchMaking, bool Casual, bool PlanetWars)
        {
            SpringBattle battle;
            using (var db = new ZkDataContext())
            {
                battle = db.SpringBattles.Where(x => x.SpringBattleID == BattleID)
                                        .Include(x => x.ResourceByMapResourceID)
                                        .Include(x => x.SpringBattlePlayers)
                                        .Include(x => x.SpringBattleBots)
                                        .FirstOrDefault();
                if (battle.HasBots || battle.SpringBattlePlayers.Select(x => x.AllyNumber).Distinct().Count() < 2) return Content("Battle type currently not supported for ratings");
                battle.ApplicableRatings = (MatchMaking ? RatingCategoryFlags.MatchMaking : 0) | (Casual ? RatingCategoryFlags.Casual : 0) | (PlanetWars ? RatingCategoryFlags.Planetwars : 0);
                db.SaveChanges();
            }
            return Detail(BattleID);
        }
    }

    public struct BattleQuickInfo
    {
        public SpringBattle Battle { get; set; }
        public IEnumerable<SpringBattlePlayer> Players { get; set; }
        public Resource Map { get; set; }
        public Resource Mod { get; set; }
    }
}